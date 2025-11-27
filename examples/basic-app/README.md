# GosikiOS Basic App Example

最小限のアプリケーション例です。Port Manager を使ってポート管理を行う基本的なパターンを示しています。

## セットアップ

```bash
cd examples/basic-app
npm install  # 依存関係がある場合のみ
```

## 実行

```bash
npm start
# または
node index.mjs
```

## コードの説明

```javascript
import { PortManager } from '../../core/port-manager/index.mjs';

const pm = new PortManager();

// ポート割り当て
const port = await pm.allocate(undefined, {
  app: 'basic-app',
  worktree: 'main',
  service: 'http-server'
});

// 終了時にポート解放
process.on('SIGINT', async () => {
  await pm.release(port);
  process.exit(0);
});
```

---

## 本番環境での使用方法

このデモを本番環境で使う場合の移行パスを説明します。

### Phase 1（現在、v0.1.x）

**相対パスでimport**

```javascript
// あなたのプロジェクトから相対パスで参照
import { PortManager } from './path/to/gosiki/core/port-manager/index.mjs';

const pm = new PortManager();
const port = await pm.allocate();
```

### Phase 2（npm化後、v1.0.0~）

**npm packageとしてimport**

```bash
# npm installで追加
npm install @gosiki-os/port-manager
```

```javascript
// npm packageとしてimport
import { PortManager } from '@gosiki-os/port-manager';

const pm = new PortManager();
const port = await pm.allocate();
```

### 設定のカスタマイズ

本番環境では設定をカスタマイズできます:

```javascript
const pm = new PortManager({
  // ポート範囲を指定
  range: { start: 8000, end: 8999 },

  // レジストリファイルの場所
  registryPath: '/var/app/gosiki-ports.json'
});

// メタデータを付与
const port = await pm.allocate(undefined, {
  app: 'my-production-app',
  worktree: 'production',
  environment: 'prod',
  region: 'us-west-2'
});
```

### エラーハンドリング

本番環境では適切なエラーハンドリングが必要です:

```javascript
try {
  const port = await pm.allocate();
  console.log(`Server started on port ${port}`);
} catch (error) {
  if (error.message.includes('No available ports')) {
    // フォールバック処理
    console.error('All ports are in use, trying alternative range...');
    const fallbackPm = new PortManager({
      range: { start: 9000, end: 9999 }
    });
    const port = await fallbackPm.allocate();
    console.log(`Server started on fallback port ${port}`);
  } else {
    throw error;
  }
}
```

### グループ割り当ての使用

複数のサービス（frontend, backend, database等）を同時に管理する場合:

```javascript
// グループ割り当て
const group = await pm.allocateGroup(3,
  { app: 'my-app', worktree: 'production' },
  ['frontend', 'backend', 'database']
);

console.log('Allocated ports:');
console.log(`  Frontend: ${group.ports.frontend}`);
console.log(`  Backend: ${group.ports.backend}`);
console.log(`  Database: ${group.ports.database}`);

// 使用後は一括解放
await pm.releaseGroup(group.groupId);
```

---

## Phase 1b以降の機能追加（v0.2.0~）

v0.2.0（Phase 1b）では Process Manager が追加されます:

```javascript
import { ProcessManager } from '@gosiki-os/process-manager';

const procManager = new ProcessManager();

// プロセスの起動とポート管理を統合
const process = await procManager.start('node', ['server.js'], {
  port,
  app: 'my-app',
  worktree: 'production'
});

// プロセスの監視
procManager.on('exit', (proc) => {
  console.log(`Process ${proc.pid} exited`);
  pm.release(proc.port);
});
```

---

## 参考資料

- [Port Manager API Reference](../../core/port-manager/README.md)
- [GosikiOS Protocol](../../docs/gosiki-protocol.md)
- [Demo CLI](../demo-cli/README.md)

---

## トラブルシューティング

### ポートが割り当てられない

```bash
# ポート使用状況を確認
node ../../core/port-manager/cli.mjs --list

# または
node ../../core/port-manager/cli.mjs --dashboard
```

### レジストリのクリーンアップ

```bash
# 全ポート割り当てをクリア
node ../../core/port-manager/cli.mjs --cleanup
```

### 特定のポートを確認

```bash
# ポートが使われているか確認
node ../../core/port-manager/cli.mjs --detect 3000

# プロセスを強制終了
node ../../core/port-manager/cli.mjs --kill-port 3000 --force
```
