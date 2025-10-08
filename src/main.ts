import * as core from "@actions/core"

import { getClang } from "./installer"

async function main() {
  const version = core.getInput("ndk-version")
  const addToPath = core.getBooleanInput("add-to-path")
  const localCache = core.getBooleanInput("local-cache")

  const { path } = await getClang(version, {
    addToPath,
    localCache,
  })

  core.setOutput("clang-path", path)
  core.setOutput("ndk-version", version)
}

export function asError(error: unknown): Error | string {
  if (typeof error === "string") return error
  else if (error instanceof Error) return error
  else return String(error)
}

main().catch((error: unknown) => {
  core.setFailed(asError(error))
})
