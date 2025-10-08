import { mkdir, readFile } from "node:fs/promises"
import * as os from "node:os"
import * as path from "node:path"

import * as cache from "@actions/cache"
import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"

interface Options {
  addToPath: boolean
  localCache: boolean
}

interface Mapping {
  mapping: Record<string, string>
}

export async function getClang(version: string, options: Options) {
  checkCompatibility()

  const clangRevision = await getClangRevision(version)
  const cacheKey = getCacheKey(version, clangRevision)
  const cacheDir = path.join(
    os.homedir(),
    ".setup-ndk-clang",
    version,
    clangRevision,
  )

  let installPath: string
  installPath = tc.find("ndk-clang", `${version}-${clangRevision}`)

  if (installPath) {
    core.info(`Found in tool cache @ ${installPath}`)
  } else if (options.localCache) {
    const restored = await cache.restoreCache([cacheDir], cacheKey)
    if (restored === cacheKey) {
      core.info(`Found in local cache @ ${cacheDir}`)
      installPath = cacheDir
    }
  }

  if (!installPath) {
    core.info(`Attempting to download ndk-${version} clang-${clangRevision}...`)
    const downloadUrl = getDownloadUrl(version, clangRevision)
    const downloadPath = await tc.downloadTool(downloadUrl)

    core.info("Extracting...")
    const extractedPath = await extractArchive(downloadPath)

    core.info("Adding to the tool cache...")
    installPath = await tc.cacheDir(
      extractedPath,
      "ndk-clang",
      `${version}-${clangRevision}`,
    )

    if (options.localCache) {
      core.info("Adding to the local cache...")
      const { cp } = await import("node:fs/promises")
      await mkdir(cacheDir, { recursive: true })
      await cp(installPath, cacheDir, { recursive: true })
      await cache.saveCache([cacheDir], cacheKey)
      installPath = cacheDir
    }

    core.info("Done")
  }

  if (options.addToPath) {
    const binPath = path.join(installPath, "bin")
    core.addPath(binPath)
    core.info("Added to path")
  } else {
    core.info("Not added to path")
  }

  return { path: installPath }
}

async function getClangRevision(ndkVersion: string): Promise<string> {
  const mappingUrl =
    "https://raw.githubusercontent.com/Ylarod/setup-ndk-clang/refs/heads/main/mapping.json"

  core.info(`Fetching mapping from ${mappingUrl}...`)
  const mappingContent = await tc.downloadTool(mappingUrl)
  const mappingData = JSON.parse(
    await readFile(mappingContent, { encoding: "utf-8" }),
  ) as Mapping

  const clangRevision = mappingData.mapping[ndkVersion]
  if (!clangRevision) {
    throw new Error(
      `No clang revision found for NDK version ${ndkVersion}. Available versions: ${Object.keys(mappingData.mapping).join(", ")}`,
    )
  }

  core.info(`Found clang revision ${clangRevision} for NDK ${ndkVersion}`)
  return clangRevision
}

async function extractArchive(downloadPath: string): Promise<string> {
  const platform = os.platform()

  if (platform === "win32") {
    return await tc.extractTar(downloadPath, undefined, [
      "-x",
      "--use-compress-program=zstd -d",
    ])
  }
  return await tc.extractTar(downloadPath, undefined, [
    "-x",
    "--use-compress-program=unzstd",
  ])
}

function checkCompatibility() {
  const supported = ["linux-x64", "win32-x64", "darwin-x64", "darwin-arm64"]

  const platform = os.platform()
  const arch = os.arch()
  const host = `${platform}-${arch}`

  if (!supported.includes(host)) {
    throw new Error(`Unsupported host "${host}"`)
  }
}

function getPlatformString() {
  const platform = os.platform()
  switch (platform) {
    case "linux":
      return "linux-x86"
    case "win32":
      return "windows-x86"
    case "darwin":
      return "darwin-x86"
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

function getCacheKey(version: string, clangRevision: string) {
  const platform = getPlatformString()
  return `setup-ndk-clang-${version}-${clangRevision}-${platform}`
}

function getDownloadUrl(version: string, clangRevision: string) {
  const platform = getPlatformString()
  const filename = `clang-${platform}-ndk-${version}-${clangRevision}.tar.zst`
  return `https://github.com/Ylarod/setup-ndk-clang/releases/download/prebuilt/${filename}`
}
