import { removeChildren } from "./functions.js";

const FILE_SIZE_CONFIRM_LIMIT = 10 << 20 // 10MB

const fileImporter = document.getElementById('file-importer')! as HTMLButtonElement
const fileExporter = document.getElementById('file-exporter')! as HTMLButtonElement
const sheet = document.getElementById('sheet')! as HTMLDivElement

const bitObjects: number[][] = []
let sheetName = null

// 内部的にファイルを開くためのinput要素。
const _fileInput = document.createElement('input')
_fileInput.type = 'file'

fileImporter.addEventListener('click', () => {
  _fileInput.click()
})

_fileInput.addEventListener('change', async () => {
	const file = _fileInput.files![0];
  sheetName = file.name
	const reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onload = async () => {
		bitObjects.splice(0);
		removeChildren('sheet')
		const dataView = new DataView(reader.result! as ArrayBuffer)
		if (FILE_SIZE_CONFIRM_LIMIT < dataView.byteLength && !window.confirm(`ファイルサイズが「${dataView.byteLength}」バイトあります。\n処理を続行しますか???`)) {
			return;
		};
		try {
      for (let i = 0; i < dataView.byteLength; i++) {
        const byteArray: number[] = []
        const byteData = dataView.getUint8(i)
        for (let j = 0; j < 8; j++) {
          byteArray.push(byteData >> j & 1)
        }
        bitObjects.push(byteArray)
      }
      for (const byteArray of bitObjects) {
        const byteBox = document.createElement('div')
        byteBox.classList.add('byte', 'flex', 'flex-nowrap', 'mr-2', 'mb-2', 'border-2', 'border-black')
        for (const bit of byteArray) {
          const bitBox = document.createElement('div')
          bitBox.classList.add('bit', 'w-10', 'h-10', 'flex', 'justify-center', 'items-center', 'border-2', 'border-black')
          bitBox.classList.add(bit ? 'bg-yellow-300' : 'bg-transparent')
          bitBox.textContent = bit ? '1' : '0'
          bitBox.addEventListener('click', () => {
            bitBox.classList.toggle('bg-yellow-300')
            bitBox.classList.toggle('bg-transparent')
            bitBox.textContent = bitBox.classList.contains('bg-yellow-300') ? '1' : '0'
            const byteIndex = Array.from(byteBox.parentNode!.children).indexOf(byteBox)
            const bitIndex = Array.from(bitBox.parentNode!.children).indexOf(bitBox)
            bitObjects[byteIndex][bitIndex] = bitBox.classList.contains('bg-yellow-300') ? 1 : 0
          })
          byteBox.appendChild(bitBox)
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        sheet.appendChild(byteBox)
      }
		} catch (ex) {
      console.error(ex)
		}
	}
})

fileExporter.addEventListener('click', () => {
  const flattenByteArray = []
  for (const byteArray of bitObjects) {
    for (const bit of byteArray) {
      flattenByteArray.push(bit)
    }
  }
  const bytes = new Uint8Array(flattenByteArray.length / 8)
  for (let i = 0; i < flattenByteArray.length; i++) {
    const bitIndex = i % 8
    const byteIndex = Math.floor(i / 8)
    bytes[byteIndex] |= flattenByteArray[i] << bitIndex
  }
  const blob = new Blob([bytes], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = sheetName!
  a.click()
  URL.revokeObjectURL(url)
})
