import fetch from 'node-fetch'
import { IAlbumListModeSort } from './topic';
import { params, headers } from './util';

export interface IExif {
	exposureCompensation: string
	exposureMode: string
	exposureProgram: string
	exposureTime: string
	flash: string
	fnumber: string
	focalLength: string
	iso: string
	lensModel: string
	make: string
	meteringMode: string
	model: string
	originalTime: string
}

export interface IPhotoInfo {
	batchId: string
	browser: number
	cameratype: string
	cp_flag: boolean
	cp_x: number
	cp_y: number
	desc: string
	exif: IExif
	forum: number
	frameno: number
	height: number
	id: number
	is_video: number
	is_weixin_mode: number
	ismultiup: number
	lloc: string
	modifytime: number
	name: string
	origin: number
	origin_height: number
	origin_upload: number
	origin_url: string
	origin_uuid: string
	origin_width: number
	owner: string
	ownername: string
	photocubage: number
	phototype: number
	picmark_flag: number
	picrefer: number
	platformId: number
	platformSubId: number
	poiName: string
	pre: string
	raw: string
	raw_upload: number
	rawshoottime: string
	shoottime: string
	shorturl: string
	sloc: string
	tag: "",
	uploadtime: string
	url: string
	width: number
	yurl: number
}

export interface ITopic {
	bitmap: string,
	browser: number,
	classid: number
	comment: number
	cover_id: string
	createtime: number
	desc: string
	handset: number
	id: string
	is_share_album: number
	lastuploadtime: number
	modifytime: number
	name: string
	ownerName: string
	ownerUin: string
	pre: string
	priv: number
	pypriv: number
	share_album_owner: number
	total: number
	url: string
	viewtype: number
}

export interface IAlbumInfo {
	limit: number
	photoList: Array<IPhotoInfo>
	t: string
	topic: ITopic
	totalInAlbum: number
	totalInPage: number
}


export async function getAlbum(topic: IAlbumListModeSort): Promise<IAlbumInfo> {
	let loaded = 0
	let result!: IAlbumInfo
	const load = (): Promise<IAlbumInfo> => {
		const mainUrl = 'https://h5.qzone.qq.com/proxy/domain/photo.qzone.qq.com/fcgi-bin/cgi_list_photo'
		const urlData = params({
			topicId: topic.id,
			noTopic: 0,
			pageStart: loaded,
			pageNum: topic.total,
			skipCmtCount: 0,
			singleurl: 1,
		})
		return fetch(mainUrl + '?' + urlData, {
			method: 'GET',
			headers: headers({ 'upgrade-insecure-requests': 1 })
		}).then(res => res.json()).then(res => res.data)
	}
	while (loaded < topic.total) {
		const data = await load()
		if(!data.photoList) console.log(data)
		loaded += data.photoList.length
		if (!result) result = data
		else result.photoList.push(...data.photoList)
	}
	return result
}
