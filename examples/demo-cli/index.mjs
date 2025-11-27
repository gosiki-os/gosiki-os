#!/usr/bin/env node
/**
 * GosikiOS Demo CLI - Phase 1a
 *
 * Port Manager の基本機能をデモンストレーション
 */

import { PortManager } from '../../core/port-manager/index.mjs';
import { formatDashboard } from '../../core/port-manager/dashboard.mjs';

console.log('🚀 GosikiOS Demo CLI - Phase 1a (Port Manager)');
console.log('================================================\n');

async function main() {
  const pm = new PortManager();

  // 1. ポート割り当て
  console.log('📊 Step 1: Allocating port...');
  const port1 = await pm.allocate(undefined, {
    app: 'demo-app',
    worktree: 'main'
  });
  console.log(`   ✅ Allocated: ${port1}\n`);

  // 2. グループ割り当て
  console.log('📊 Step 2: Allocating port group...');
  const group = await pm.allocateGroup(3,
    { app: 'demo-app', worktree: 'feature/demo' },
    ['frontend', 'backend', 'test']
  );
  console.log(`   ✅ Group ID: ${group.groupId}`);
  Object.entries(group.ports).forEach(([role, port]) => {
    console.log(`      ${role}: ${port}`);
  });
  console.log('');

  // 3. ダッシュボード表示
  console.log('📊 Step 3: Displaying dashboard...\n');
  const grouped = await pm.getAllGrouped();
  const dashboard = formatDashboard(grouped);
  console.log(dashboard);

  // 4. クリーンアップ
  console.log('📊 Step 4: Cleanup...');
  await pm.release(port1);
  await pm.releaseGroup(group.groupId);
  console.log('   ✅ Released all ports\n');

  console.log('✨ Demo completed!\n');
  console.log('📚 Next steps:');
  console.log('   1. Read: examples/basic-app/README.md');
  console.log('   2. Try: cd examples/basic-app && node index.mjs');
  console.log('   3. Docs: https://github.com/gosiki-org/gosiki\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
