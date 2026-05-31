'use strict';

// Dispatches a runtime exercise item to the matching renderer.

import { mountMultipleChoice } from './multipleChoice.js';
import { mountMatchPairs } from './matchPairs.js';
import { mountListen } from './listen.js';
import { mountWordBank } from './wordBank.js';
import { mountMouillering } from './mouillering.js';

const MOUNTERS = {
  multipleChoice: mountMultipleChoice,
  matchPairs: mountMatchPairs,
  listen: mountListen,
  wordBank: mountWordBank,
  mouillering: mountMouillering
};

export function mountExercise(stage, item, api) {
  const mount = MOUNTERS[item.type];
  if (!mount) {
    console.warn('Geen renderer voor:', item.type);
    return api.solved();
  }
  mount(stage, item, api);
}
