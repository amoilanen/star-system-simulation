/* @ts-self-types="./star_kernel.d.ts" */

/**
 * The Rust/WASM physics kernel with emergent accretion. Construct once per run,
 * then drive with `step`. Deterministic for a given configuration.
 */
export class Kernel {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        KernelFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_kernel_free(ptr, 0);
    }
    /**
     * Length (in f32 lanes) of the body buffer.
     * @returns {number}
     */
    body_len() {
        const ret = wasm.kernel_body_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Pointer to the interleaved body buffer in linear memory.
     * @returns {number}
     */
    body_ptr() {
        const ret = wasm.kernel_body_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Physically meaningful elapsed time in sim seconds: formation progress
     * mapped onto the REAL formation durations, then the stellar clock.
     * @returns {number}
     */
    elapsed_sim_seconds() {
        const ret = wasm.kernel_elapsed_sim_seconds(this.__wbg_ptr);
        return ret;
    }
    /**
     * Number of f64 lanes per packed event (`[type, simTime, dataA, dataB]`).
     * @returns {number}
     */
    event_stride() {
        const ret = wasm.kernel_event_stride(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Pointer to the packed events buffer (f64 lanes) drained each `step`.
     * @returns {number}
     */
    events_ptr() {
        const ret = wasm.kernel_events_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * (Re)initialize the kernel for a run (the `PhysicsKernel.init` contract).
     * @param {number} mass
     * @param {number} cloud_extent
     * @param {number} pace
     * @param {number} h
     * @param {number} he
     * @param {number} metals
     * @param {number} particle_count
     */
    constructor(mass, cloud_extent, pace, h, he, metals, particle_count) {
        const ret = wasm.kernel_new(mass, cloud_extent, pace, h, he, metals, particle_count);
        this.__wbg_ptr = ret;
        KernelFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * The central gravitational parameter this kernel is actually integrating
     * against.
     *
     * Exported so the renderer can reconstruct exactly the Kepler conics the
     * bodies are following (the orbit-path overlay). The kernel is the single
     * source of truth for it: the host used to recompute `mu` itself from
     * duplicated `GRAVITY` / `ORBITAL_MASS_SCALE` constants, which was one more
     * thing that had to be kept in sync by hand.
     * @returns {number}
     */
    orbital_mu() {
        const ret = wasm.kernel_orbital_mu(this.__wbg_ptr);
        return ret;
    }
    /**
     * Length (in f32 lanes) of the particle buffer.
     * @returns {number}
     */
    particle_len() {
        const ret = wasm.kernel_particle_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Pointer to the interleaved particle buffer in linear memory.
     * @returns {number}
     */
    particle_ptr() {
        const ret = wasm.kernel_particle_ptr(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * The lifecycle stage the simulation is in after the latest `step`.
     * @returns {number}
     */
    stage() {
        const ret = wasm.kernel_stage(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Normalized 0..1 progress through the current stage (accretion fraction for
     * formation stages, elapsed/duration for stellar stages).
     * @returns {number}
     */
    stage_progress() {
        const ret = wasm.kernel_stage_progress(this.__wbg_ptr);
        return ret;
    }
    /**
     * Mass (M☉) of the central object right now: the accreted core while the
     * star is assembling, the finished star during its life, and only the
     * compact remnant's mass once it has died (mirror of `currentStarMass`).
     * @returns {number}
     */
    star_mass_solar() {
        const ret = wasm.kernel_star_mass_solar(this.__wbg_ptr);
        return ret;
    }
    /**
     * Advance the simulation by `dt_sim_seconds`, returning the number of events
     * emitted this step (packed into the events buffer) — the
     * `PhysicsKernel.step` contract.
     * @param {number} dt_sim_seconds
     * @returns {number}
     */
    step(dt_sim_seconds) {
        const ret = wasm.kernel_step(this.__wbg_ptr, dt_sim_seconds);
        return ret >>> 0;
    }
}
if (Symbol.dispose) Kernel.prototype[Symbol.dispose] = Kernel.prototype.free;

/**
 * Trivial export proving the WASM boundary compiles and links (kept from the
 * scaffold for a cheap smoke check).
 * @returns {number}
 */
export function kernel_version() {
    const ret = wasm.kernel_version();
    return ret >>> 0;
}

/**
 * The disc's snow line, in AU: the distance beyond which ices condense and
 * accretion becomes far more productive. Exported so hosts and tests describe
 * the disc's zones with the kernel's value rather than a copy of it.
 * @returns {number}
 */
export function snow_line_au() {
    const ret = wasm.snow_line_au();
    return ret;
}

/**
 * The gravitational softening length the kernel integrates with, in scene
 * units (= AU).
 *
 * Exported because a host that wants to reproduce the kernel's own notion of
 * "is this body bound?" must use the SAME softened potential
 * `-mu / sqrt(r² + softening²)`. Re-declaring the constant host-side would let
 * the two drift apart silently, which is exactly what the removal of the
 * mirrored TypeScript kernel was meant to prevent.
 * @returns {number}
 */
export function softening() {
    const ret = wasm.softening();
    return ret;
}

/**
 * The `WebAssembly.Memory` backing this module, so TypeScript can build
 * `Float32Array` / `Float64Array` views over the buffer pointers below.
 * @returns {any}
 */
export function wasm_memory() {
    const ret = wasm.wasm_memory();
    return ret;
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_memory_de265df8aadd6273: function() {
            const ret = wasm.memory;
            return ret;
        },
        __wbg___wbindgen_throw_344f42d3211c4765: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./star_kernel_bg.js": import0,
    };
}

const KernelFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_kernel_free(ptr, 1));

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('star_kernel_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
