/**
 * GosikiOS Basic App Example
 *
 * 最小限のアプリケーション例
 */

import { PortManager } from '../../core/port-manager/index.mjs';

async function startApp() {
  console.log('🚀 Starting Basic App...\n');

  const pm = new PortManager();

  // ポート割り当て
  const port = await pm.allocate(undefined, {
    app: 'basic-app',
    worktree: 'main',
    service: 'http-server'
  });

  console.log(`✅ App started on port ${port}`);
  console.log(`   Visit: http://localhost:${port}\n`);

  // 疑似HTTPサーバー（実際はここにExpress等を実装）
  console.log('💡 Press Ctrl+C to stop\n');

  // 終了時にポート解放
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping app...');
    await pm.release(port);
    console.log('✅ Port released');
    process.exit(0);
  });

  // アプリケーションロジック
  // ここに実際のサーバー処理を実装
  await new Promise(() => {}); // 無限待機
}

startApp().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
