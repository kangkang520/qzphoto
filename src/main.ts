import fs from 'fs'
import path from 'path'
import { getTopics, ITopicInfo } from "./topic"
import { getAlbum, IAlbumInfo, IPhotoInfo } from "./album"
import moment from 'moment'
import { downloadPhoto } from './photo'
import { initUtil } from './util';

let out!: string
//获取输出目录
function init() {
	initUtil()
	const config = require('../config.json')
	if (config.outdir) config.outdir = path.resolve(path.join(__dirname, '..'), config.outdir)
	out = config.outdir || path.join(__dirname, '../result')
	if (!fs.existsSync(out)) fs.mkdirSync(out)
}


//写文件
function write(file: string, data: string | Buffer) {
	fs.writeFileSync(path.resolve(out, file), data)
}

//写json
function writeJson(file: string, data: any) {
	write(file, JSON.stringify(data, null, 4))
}

//建目录
function automakedir(dirname: string) {
	const dir = path.resolve(out, dirname)
	if (!fs.existsSync(dir)) fs.mkdirSync(dir)
	return dir
}

//下载相册
async function loadbooks(topic: ITopicInfo) {
	const albums: Array<IAlbumInfo> = []
	for (let i = 0; i < topic.albumListModeSort.length; i++) {
		const album = topic.albumListModeSort[i]
		automakedir(album.name)
		const book = await getAlbum(album)
		writeJson(path.join(album.name, 'album.json'), book)
		console.log(`相册${album.name}加载完成！`)
		albums.push(book)
	}
	return albums
}

//下载照片
async function loadphotos(albums: Array<IAlbumInfo>, total: number, topicNames: Array<string>) {
	const errorImgs: Array<{ photo: IPhotoInfo, savename: string, savedir: string }> = []
	let loaded = 0
	for (let i = 0; i < albums.length; i++) {
		const album = albums[i]
		automakedir(path.join(topicNames[i], 'photos'))
		for (let j = 0; j < album.photoList.length; j += 10) {
			const downloadSave = async (N: number) => {
				if (N >= album.photoList.length) return
				const photo = album.photoList[N]
				const index = ((N + 1) + '').padStart(3, '0')
				const time = moment(photo.rawshoottime || photo.uploadtime).format('YYYYMMDDHHmmss')
				const saveName = `${index}_${time}.`
				try {
					const { data, ext } = await downloadPhoto(photo)
					write(path.join(album.topic.name, 'photos', saveName + ext), data)
					writeJson(path.join(album.topic.name, 'photos', saveName + 'json'), photo)
					loaded++
					console.log(`下载 [${loaded}/${total}]\x1b[18G${album.topic.name}/${saveName}${ext} 完成!`)
				} catch (err) {
					console.log(`错误 [${i}:${j}] ${album.topic.name}`)
					errorImgs.push({ photo, savename: saveName, savedir: path.join(album.topic.name, 'photos') })
				}
			}
			const D = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
			await Promise.all(D.map(n => downloadSave(j + n)))
		}
	}
	return errorImgs
}

//开始下载
export async function start() {
	try {
		init()
		const topic = await getTopics()
		writeJson('topic.json', topic)
		console.log('相册列表加载完成!')
		const albums = await loadbooks(topic)
		console.log('相册信息加载完成!')
		let total = 0
		albums.forEach(ai => total += ai.photoList.length)
		const errors = await loadphotos(albums, total, topic.albumListModeSort.map(a => a.name))
		console.log('相片下载完成!')
		if (errors.length) writeJson('errors.json', errors)
	}
	catch (e) {
		console.log(e.message)
	}

}

//下载未完成的数据
export async function downloadErrorPhoto() {
	const log0 = () => console.log(`完毕！总计0，成功0，失败0`)
	try {
		init()
		const filepath = path.resolve(out, 'errors.json')
		if (!fs.existsSync(filepath)) return log0()
		let errorPhotos: Array<any> = JSON.parse(fs.readFileSync(filepath) + '')
		if (!errorPhotos) return log0()
		const total = errorPhotos.length
		let successed = 0
		let failed = 0
		for (let i = 0; i < errorPhotos.length; i++) {
			const { photo, savename, savedir } = errorPhotos[i] as { [i: string]: any, photo: IPhotoInfo }
			try {
				const { data, ext } = await downloadPhoto(photo)
				write(path.join(savedir, savename + ext), data)
				writeJson(path.join(savedir, savename + 'json'), photo)
				errorPhotos[i] = null
				console.log(`下载 [${i + 1}]\x1b[18G${savedir}/${savename}${ext} 完成!`)
				successed++
			} catch (err) {
				console.log(`下载${photo.name}失败!`)
				failed++
			}
		}
		errorPhotos = errorPhotos.filter(e => !!e)
		if (errorPhotos.length) writeJson('errors.json', errorPhotos)
		else fs.unlinkSync(filepath)
		console.log(`完毕！总计${total}，成功${successed}，失败${failed}`)
	} catch (err) {
		console.log(err.message)
	}
}
