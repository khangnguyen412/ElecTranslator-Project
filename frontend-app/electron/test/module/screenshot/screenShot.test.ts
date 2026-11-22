import assert from 'assert';
import { pickDesktopSource } from '../../../module/screenshot/screenShot';
import type { pickDesktopSourceParam } from '../../../type/screenShot.type';

const displays = [
    { id: '3020229871', label: '\\\\.\\DISPLAY2 (ASUS)' },  // right screen
    { id: '1260585902', label: '\\\\.\\DISPLAY1 (BenQ)' },  // left/primary
];
const sourcesEmptyId = [
    { display_id: '', name: 'Screen 1' },
    { display_id: '', name: 'Screen 2' },
];
const sourcesGoodId = [
    { display_id: '1260585902', name: 'irrelevant' },
    { display_id: '3020229871', name: 'correct' },
];

const pick = (display: unknown, sources: unknown) => pickDesktopSource({ display, sources, thumbnailSize: { width: 1, height: 1 } } as pickDesktopSourceParam);

const run = async () => {
    const viaId = await pick(displays[0], sourcesGoodId);
    assert.strictEqual(viaId.source.name, 'correct');
    assert.match(viaId.trace.join(), /Attempt 1 hit/);

    const viaRight = await pick(displays[0], sourcesEmptyId);
    assert.strictEqual(viaRight.source.name, 'Screen 2');
    assert.match(viaRight.trace.join(), /Attempt 2 hit/);

    const viaLeft = await pick(displays[1], sourcesEmptyId);
    assert.strictEqual(viaLeft.source.name, 'Screen 1');
    assert.match(viaLeft.trace.join(), /Attempt 2 hit/);

    console.log('screenshot.test ok', viaLeft.trace);
}

run().catch((e) => {
    console.error(e);
    process.exit(1);
})