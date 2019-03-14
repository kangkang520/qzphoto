import path from 'path'
import fs from 'fs'

let config!: { [i: string]: any }
export function initUtil() {
	if (!fs.existsSync(path.join(__dirname, '../config.json'))) throw new Error('配置文件不存在')
	if (config) return
	config = require('../config.json')
	if (!config.cookie) throw new Error('配置文件缺少cookie')
	if (!config.qq) throw new Error('配置文件缺少qq')
	if (!config.gtk) throw new Error('配置文件缺少gtk')
}

export function headers(others: { [i: string]: string | number }) {
	return {
		'accept': '*/*',
		'accept-encoding': 'gzip, deflate, br',
		'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
		'cache-control': 'no-cache',
		'content-type': 'application/json',
		'cookie': config.cookie,
		'pragma': 'no-cache',
		...others,
		'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3679.0 Safari/537.36',
	}
}

export function params(others: { [i: string]: any }) {
	const datas = {
		g_tk: config.gtk,
		t: 942347320,
		hostUin: config.qq,
		uin: config.qq,
		appid: 4,
		inCharset: 'utf-8',
		outCharset: 'utf-8',
		source: 'qzone',
		plat: 'qzone',
		format: 'json',
		notice: 0,
		filter: 1,
		handset: 4,
		pageNumModeSort: 40,
		pageNumModeClass: 15,
		needUserInfo: 1,
		idcNum: 4,
		_: 1552574962111,
		...others,
	}
	return Object.keys(datas).map(key => `${key}=${encodeURI((datas as any)[key])}`).join('&')
}