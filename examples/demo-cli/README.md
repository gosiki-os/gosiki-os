# GosikiOS Demo CLI

GosikiOS Phase 1a (Port Manager) の基本機能をデモンストレーションします。

## 実行方法

### ルートディレクトリから

```bash
# npm scriptで実行
npm run demo

# または直接実行
node examples/demo-cli/index.mjs
```

### このディレクトリから

```bash
cd examples/demo-cli
node index.mjs
```

## デモ内容

1. **ポート割り当て**: 単一ポートの自動割り当て
2. **グループ割り当て**: 複数ポート（frontend, backend, test）の一括割り当て
3. **ダッシュボード表示**: 割り当て状況の可視化
4. **クリーンアップ**: ポート解放

## 次のステップ

- [基本アプリケーション例](../basic-app/README.md) - 実際のアプリケーションでの使用例
- [Port Manager API](../../core/port-manager/README.md) - 詳細なAPI仕様
