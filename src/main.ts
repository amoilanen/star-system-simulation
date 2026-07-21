// Application bootstrap (spec §2, §3.1). Mounts the root {@link App}, which owns
// the Setup ↔ Run screen routing and the per-frame simulation loop.

import './styles.css';
import { App } from './app/App';

const root = document.getElementById('app');
if (!root) {
  throw new Error('Root element #app not found');
}

new App(root);
