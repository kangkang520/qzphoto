import request from 'request'
import { IPhotoInfo } from "./album";


const exts: { [i: string]: string } = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/gif': 'gif',
	'image/bmp': 'bmp',
}

export function downloadPhoto(img: IPhotoInfo): Promise<{ mime: string, ext: string, data: Buffer }> {
	return new Promise<any>((resolve, reject) => {
		let data: Buffer | null = null
		const res = request(img.raw || img.url, (err, res) => {
			if (err) return reject(err)
			const mime = res.headers['content-type']!.trim()
			if (!exts[mime]) throw new Error(`Mime ${mime} 不存在`)
			resolve({ mime, ext: exts[mime], data })
		})
		res.on('data', d => {
			if (!data) data = d as Buffer
			else data = Buffer.concat([data, d as Buffer])
		})
	})
}