import { headers, params } from './util'
import fetch from 'node-fetch'


export interface IAlbumListModeSort {
	allowAccess: number
	anonymity: number
	bitmap: string
	classid: number
	comment: number
	createtime: number
	desc: string
	handset: number
	id: string
	lastuploadtime: number
	modifytime: number
	name: string
	order: number
	pre: string
	priv: number
	pypriv: number
	total: number
	viewtype: number
}

export interface ITopicInfo {
	albumListModeSort: Array<IAlbumListModeSort>
	albumsInUser: number
	classList: Array<{ id: number, name: string }>
	limit: number
	mode: number
	nextPageStartModeSort: number
	ownerCapacity: string
	ownerTotalCapacity: string
	qqVipLevel: number
	qzoneVipLevel: number
	sortOrder: number
	t: string
	totalInPageModeSort: number
	user: any
}


export function getTopics(): Promise<ITopicInfo> {
	const mainUrl = 'https://h5.qzone.qq.com/proxy/domain/photo.qzone.qq.com/fcgi-bin/fcg_list_album_v3'
	const urlData = params({})
	return fetch(mainUrl + '?' + urlData, {
		method: 'GET',
		headers: headers({ referer: 'https://user.qzone.qq.com/proxy/domain/qzs.qq.com/qzone/photo/v7/page/photo.html?init=photo.v7/module/albumList/index' })
	}).then(res => res.json()).then(res => res.data)
}