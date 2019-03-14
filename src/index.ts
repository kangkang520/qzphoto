import { start, downloadErrorPhoto } from "./main"
import path from 'path'

async function main(method: string = 'help') {
	try {
		if (method == 'downall') await start()
		else if (method == 'downerror') await downloadErrorPhoto()
		else {
			console.log('支持指令列表:')
			console.log('  下载相册到本地： \x1b[18G downall')
			console.log('  下载出错的照片： \x1b[18G downerror')
			console.log('  查看帮助： \x1b[18G help')
			console.log('配置文件位置:')
			console.log(path.join(__dirname, '../config.json'))
		}
	} catch (err) {
		console.log(err.message)
	}
}

main(process.argv[2])