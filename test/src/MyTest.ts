import { computeOperations } from "electron-updater/out/differentialDownloader/downloadPlanBuilder"
import { BlockMap } from "builder-util-runtime"
import { gunzipSync } from "zlib"
import { readFileSync } from "fs"
import { log } from "builder-util"

test("Test!", () => {
  const oldFile = "C:\\Users\\me\\Dev\\electron-builder\\resources\\Rewind-Setup-0.1.1.exe.blockmap"
  const newFile = "C:\\Users\\me\\Dev\\electron-builder\\resources\\Rewind-Setup-0.2.0-alpha.1.exe.blockmap"

  function readBlockMap(data: Buffer): BlockMap {
    try {
      return JSON.parse(gunzipSync(data).toString())
    } catch (e) {
      throw new Error(`Cannot parse blockmap error: ${e}`)
    }
  }

  function readBlockMapFromName(file: string) {
    return readBlockMap(readFileSync(file))
  }

  // readBlockMapFromName("C:\\Users\\me\\Dev\\rewind\\apps\\rewind-electron\\dist\\electron\\Rewind Setup 0.1.3-alpha.1.exe.blockmap")
  const oldBlockMap = readBlockMapFromName(oldFile)
  const newBlockMap = readBlockMapFromName(newFile)

  const operations = computeOperations(oldBlockMap, newBlockMap, log)

  let sumDownload = 0,
    sumSaved = 0
  for (const op of operations) {
    const { kind, start, end } = op
    if (kind === 1) {
      sumDownload += end - start
    } else {
      sumSaved += end - start
    }
  }
  const tot = sumDownload + sumSaved
  const toMegaBytes = (x: number) => (x / (1 << 20)).toFixed(2)
  log.info(`Download: ${toMegaBytes(sumDownload)}MB / ${toMegaBytes(tot)}MB -> saved ${((sumSaved / tot) * 100).toFixed(2)}%`)
})
