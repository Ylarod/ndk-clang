# ndk-clang

[简体中文](README.zh-CN.md) | English

Android NDK Clang prebuilt toolchain and GitHub Action for easy CI/CD integration.

This project provides:

1. **Prebuilt Clang toolchains** - Repackaged from AOSP for easy download
2. **GitHub Action** - Easy setup for CI/CD workflows

## Quick Start (GitHub Action)

```yml
steps:
  - uses: actions/checkout@v4
  - uses: Ylarod/setup-ndk-clang@v1
    with:
      ndk-version: r29
  - run: clang --version
```

## Features

- 🚀 Support for multiple NDK versions (r29, r28c, r27d, r26d, r25c)
- 💾 Automatic caching to speed up builds
- 🖥️ Cross-platform support (Linux, macOS, Windows)
- 📦 Reproducible builds with zstd compression
- ⚡ Fast downloads from GitHub Releases

## Usage

### Basic Usage

```yml
steps:
  - uses: actions/checkout@v4
  - uses: Ylarod/setup-ndk-clang@v1
    with:
      ndk-version: r29
  - run: clang --version
```

### Using Installation Path

```yml
steps:
  - uses: actions/checkout@v4
  - uses: Ylarod/setup-ndk-clang@v1
    id: setup-clang
    with:
      ndk-version: r29
      add-to-path: false
  - run: ${{ steps.setup-clang.outputs.clang-path }}/bin/clang --version
```

### Enabling Local Cache

```yml
steps:
  - uses: actions/checkout@v4
  - uses: Ylarod/setup-ndk-clang@v1
    with:
      ndk-version: r29
      local-cache: true
```

### Multiple Toolchain Versions

```yml
steps:
  - uses: actions/checkout@v4

  - uses: Ylarod/setup-ndk-clang@v1
    id: clang-r29
    with:
      ndk-version: r29
      add-to-path: false

  - uses: Ylarod/setup-ndk-clang@v1
    id: clang-r26d
    with:
      ndk-version: r26d
      add-to-path: false

  - name: Build with r29
    run: ${{ steps.clang-r29.outputs.clang-path }}/bin/clang myapp.c -o myapp-r29

  - name: Build with r26d
    run: ${{ steps.clang-r26d.outputs.clang-path }}/bin/clang myapp.c -o myapp-r26d
```

## Action Inputs

| Input         | Description                                             | Required | Default |
| ------------- | ------------------------------------------------------- | -------- | ------- |
| `ndk-version` | NDK version (e.g., r29, r28c, r27d, r26d, r25c)         | Yes      | -       |
| `add-to-path` | Add the installation directory's bin folder to the PATH | No       | `true`  |
| `local-cache` | Use the local job cache on top of the runner tool cache | No       | `false` |

## Action Outputs

| Output        | Description                              |
| ------------- | ---------------------------------------- |
| `clang-path`  | Installation path of the Clang toolchain |
| `ndk-version` | NDK version used                         |

## Supported Versions

The currently supported NDK versions and their corresponding Clang versions can be found in the [`mapping.json`](mapping.json) file.

Tested versions include:

- r29 (clang r563880c)
- r28c (clang r530567e)
- r27d (clang r522817d)
- r26d (clang r487747e)
- r25c (clang r450784d1)

## Platform Support

- Linux (x64)
- macOS (x64)
- Windows (x64)

## Direct Download (Without Action)

You can also download the prebuilt toolchains directly from [GitHub Releases](https://github.com/Ylarod/setup-ndk-clang/releases/tag/prebuilt).

Filename format: `clang-{platform}-ndk-{version}-{revision}.tar.zst`

Example:

```bash
# Download for Linux
wget https://github.com/Ylarod/setup-ndk-clang/releases/download/prebuilt/clang-linux-x86-ndk-r29-r563880c.tar.zst

# Extract
tar -I unzstd -xf clang-linux-x86-ndk-r29-r563880c.tar.zst

# Verify checksum
wget https://github.com/Ylarod/setup-ndk-clang/releases/download/prebuilt/clang-linux-x86-ndk-r29-r563880c.tar.zst.sha256
sha256sum -c clang-linux-x86-ndk-r29-r563880c.tar.zst.sha256
```

## How It Works

### Prebuilt Toolchains

1. Downloads from AOSP's Clang prebuilts repository
2. Repackages using reproducible tar with zstd compression
3. Publishes to GitHub Releases with SHA256 checksums
4. Automatically updates when `mapping.json` changes

### GitHub Action

1. Fetches the NDK version to Clang version mapping from `mapping.json`
2. Downloads the prebuilt Clang toolchain for the corresponding platform
3. Extracts and caches the toolchain to the runner's tool cache
4. Optionally adds the toolchain's bin directory to PATH

## Caching Mechanism

- **Tool Cache**: By default, uses GitHub Actions' tool cache, shared between different workflow runs on the same runner
- **Local Cache**: When `local-cache: true` is enabled, also uses GitHub Actions' cache mechanism to save the toolchain between workflow runs

## Building from Source

This repository includes the GitHub Action source code. To build:

```bash
npm install
npm run build
```

The compiled action will be in the `dist/` directory.

## License

Apache License 2.0

## Related Projects

- [setup-ndk](https://github.com/nttld/setup-ndk) - Setup Android NDK Action
- [Android Clang Prebuilts](https://android.googlesource.com/platform/prebuilts/clang/host/) - AOSP Clang Source
