(async () => {
  (function() {
    const t = document.createElement("link").relList;
    if (t && t.supports && t.supports("modulepreload")) return;
    for (const s of document.querySelectorAll('link[rel="modulepreload"]')) n(s);
    new MutationObserver((s) => {
      for (const r of s) if (r.type === "childList") for (const a of r.addedNodes) a.tagName === "LINK" && a.rel === "modulepreload" && n(a);
    }).observe(document, {
      childList: true,
      subtree: true
    });
    function e(s) {
      const r = {};
      return s.integrity && (r.integrity = s.integrity), s.referrerPolicy && (r.referrerPolicy = s.referrerPolicy), s.crossOrigin === "use-credentials" ? r.credentials = "include" : s.crossOrigin === "anonymous" ? r.credentials = "omit" : r.credentials = "same-origin", r;
    }
    function n(s) {
      if (s.ep) return;
      s.ep = true;
      const r = e(s);
      fetch(s.href, r);
    }
  })();
  function yh(i) {
    const { hydrogen: t, helium: e, metals: n } = i;
    if ([
      t,
      e,
      n
    ].some((a) => !Number.isFinite(a) || a < 0)) throw new RangeError("CloudComposition fractions must be finite and non-negative.");
    const r = t + e + n;
    if (r <= 0) throw new RangeError("CloudComposition fractions must sum to a positive value.");
    return {
      hydrogen: t / r,
      helium: e / r,
      metals: n / r
    };
  }
  const Vr = "sun-like", zi = {
    "sun-like": {
      id: "sun-like",
      nameMessageId: "preset.sunLike",
      composition: {
        hydrogen: 0.74,
        helium: 0.24,
        metals: 0.02
      },
      mass: 1,
      cloudExtent: 50,
      pace: 0.5
    },
    "low-mass": {
      id: "low-mass",
      nameMessageId: "preset.lowMass",
      composition: {
        hydrogen: 0.76,
        helium: 0.235,
        metals: 5e-3
      },
      mass: 0.5,
      cloudExtent: 35,
      pace: 0.5
    },
    "high-mass": {
      id: "high-mass",
      nameMessageId: "preset.highMass",
      composition: {
        hydrogen: 0.72,
        helium: 0.26,
        metals: 0.02
      },
      mass: 20,
      cloudExtent: 90,
      pace: 0.5
    }
  }, Eh = {
    "app.title": "Star System Simulation",
    "app.subtitle": "Watch a star system be born from a cloud of dust \u2014 and die.",
    "setup.heading": "Configure your star system",
    "setup.language": "Language",
    "setup.language.en": "English",
    "setup.language.fi": "Finnish",
    "setup.preset": "Preset",
    "setup.mass": "Cloud mass (M\u2609)",
    "setup.cloudExtent": "Cloud size",
    "setup.pace": "Simulation pace",
    "setup.pace.slow": "Real time",
    "setup.pace.fast": "One-minute lifecycle",
    "setup.composition": "Cloud composition",
    "setup.composition.hydrogen": "Hydrogen",
    "setup.composition.helium": "Helium",
    "setup.composition.metals": "Heavier elements",
    "setup.composition.hint": "Fractions are normalized to sum to 100%.",
    "setup.showEvents": "Show information about star system events",
    "setup.start": "Start simulation",
    "preset.sunLike": "Sun-like",
    "preset.lowMass": "Low-mass star",
    "preset.highMass": "High-mass star",
    "hud.pause": "Pause",
    "hud.resume": "Resume",
    "hud.rewind": "Rewind",
    "hud.rewindStop": "Stop rewind",
    "hud.reset": "Reset",
    "hud.timeScale": "Time scale",
    "hud.zoomIn": "Zoom in",
    "hud.zoomOut": "Zoom out",
    "hud.focus": "Focus",
    "hud.focus.star": "Star",
    "hud.focus.none": "Free camera",
    "hud.stage": "Stage: {stage}",
    "hud.bodyCount": "{count, plural, =0 {No orbiting bodies} one {# orbiting body} other {# orbiting bodies}}",
    "hud.elapsed": "Elapsed: {time}",
    "hud.speed": "{value} / second",
    "time.year": "{count, plural, one {year} other {years}}",
    "time.plain": "{number} {unit}",
    "time.scaled": "{number} {scale} {unit}",
    "time.lessThanOne": "< 1 {unit}",
    "time.scale.million": "million",
    "time.scale.billion": "billion",
    "time.scale.trillion": "trillion",
    "stage.dustCloud": "Dust cloud",
    "stage.protostarCoalescence": "Protostar forming",
    "stage.fusionIgnition": "Fusion ignition",
    "stage.mainSequence": "Main sequence",
    "stage.redGiant": "Red giant",
    "stage.death": "Death",
    "stage.remnant": "Remnant",
    "remnant.whiteDwarf": "white dwarf",
    "remnant.neutronStar": "neutron star",
    "remnant.pulsar": "pulsar",
    "body.protoplanet": "protoplanet",
    "body.planet": "planet",
    "body.comet": "comet",
    "body.asteroid": "asteroid",
    "hud.focus.body": "{body} #{id}",
    "event.collapseOnset": "The dust cloud begins to collapse under its own gravity.",
    "event.protostarFormed": "A protostar has formed at the center of the cloud.",
    "event.fusionIgnition": "Nuclear fusion has ignited \u2014 a star is born!",
    "event.planetFormed": "A planet has coalesced from the surrounding disk.",
    "event.redGiantOnset": "The star swells into a red giant as its core fuel runs low.",
    "event.deathEvent": "The star reaches the end of its life.",
    "event.remnantFormed": "The star leaves behind a {remnant}.",
    "event.bodyCaptured": "A visiting {body} has been captured into orbit.",
    "event.bodyEjected": "A {body} has been flung out of the star system.",
    "menu.centerOn": "Center on {target}",
    "info.heading": "What is this?",
    "info.close": "Close",
    "info.protostar.title": "Protostar",
    "info.protostar.desc": "A dense, hot clump of gas and dust at the heart of the collapsing cloud. It is not yet a true star \u2014 nuclear fusion has not begun.",
    "info.mainSequenceStar.title": "Main-sequence star",
    "info.mainSequenceStar.desc": "A stable star fusing hydrogen into helium in its core. The outward push of fusion balances gravity, and it will shine steadily like this for most of its life.",
    "info.redGiant.title": "Red giant",
    "info.redGiant.desc": "An aging star that has run low on core hydrogen. Its outer layers have swelled enormously and cooled to a red glow.",
    "info.dyingStar.title": "Dying star",
    "info.dyingStar.desc": "The star is shedding or blasting away its outer layers, exposing the hot core that will become a compact remnant.",
    "info.whiteDwarf.title": "White dwarf",
    "info.whiteDwarf.desc": "The Earth-sized, cooling core left behind by a low- or medium-mass star. Incredibly dense \u2014 a teaspoon would weigh tonnes.",
    "info.neutronStar.title": "Neutron star",
    "info.neutronStar.desc": "The collapsed core of a massive star after a supernova, made almost entirely of neutrons. A whole star's mass packed into a city-sized ball.",
    "info.pulsar.title": "Pulsar",
    "info.pulsar.desc": "A rapidly spinning neutron star that sweeps beams of radiation across space like a lighthouse, appearing to pulse.",
    "info.rockyPlanet.title": "Rocky planet",
    "info.rockyPlanet.desc": "A small, dense world made of rock and metal, like Earth or Mars. It formed from solid grains in the inner disk.",
    "info.gasGiant.title": "Gas giant",
    "info.gasGiant.desc": "A large planet made mostly of hydrogen and helium gas around a small core, like Jupiter or Saturn. It formed in the colder outer disk.",
    "info.asteroid.title": "Asteroid",
    "info.asteroid.desc": "A small rocky body, a leftover chunk from planet formation, drifting through the system.",
    "info.comet.title": "Comet",
    "info.comet.desc": "An icy body that grows a glowing tail as it nears the star and its ices vaporize. The tail always points away from the star.",
    "info.note.captured": "It has been captured into a stable orbit around the star.",
    "info.note.passing": "It is only passing through and may escape the system again.",
    "info.protoplanet.title": "Protoplanet",
    "label.stat.mass": "Mass",
    "label.stat.coreTemp": "Core temp.",
    "label.stat.surfaceTemp": "Surface temp.",
    "label.stat.velocity": "Orbital speed",
    "label.stat.distance": "Distance",
    "hud.labels": "Show labels",
    "event.bodyConsumed": "A planet has spiralled into the star and been torn apart.",
    "hud.orbits": "Show orbits",
    "info.iceGiant.title": "Ice giant",
    "info.iceGiant.desc": "A world of water, ammonia and methane ices around a rocky core, like Uranus or Neptune. It formed beyond the snow line but too far out to capture much gas."
  }, bh = {
    "app.title": "T\xE4htij\xE4rjestelm\xE4n simulaatio",
    "app.subtitle": "Katso, kuinka t\xE4htij\xE4rjestelm\xE4 syntyy p\xF6lypilvest\xE4 \u2014 ja kuolee.",
    "setup.heading": "M\xE4\xE4rit\xE4 t\xE4htij\xE4rjestelm\xE4si",
    "setup.language": "Kieli",
    "setup.language.en": "Englanti",
    "setup.language.fi": "Suomi",
    "setup.preset": "Esiasetus",
    "setup.mass": "Pilven massa (M\u2609)",
    "setup.cloudExtent": "Pilven koko",
    "setup.pace": "Simulaation tahti",
    "setup.pace.slow": "Reaaliaika",
    "setup.pace.fast": "Minuutin elinkaari",
    "setup.composition": "Pilven koostumus",
    "setup.composition.hydrogen": "Vety",
    "setup.composition.helium": "Helium",
    "setup.composition.metals": "Raskaammat alkuaineet",
    "setup.composition.hint": "Osuudet normalisoidaan niin, ett\xE4 summa on 100 %.",
    "setup.showEvents": "N\xE4yt\xE4 tietoa t\xE4htij\xE4rjestelm\xE4n tapahtumista",
    "setup.start": "K\xE4ynnist\xE4 simulaatio",
    "preset.sunLike": "Auringon kaltainen",
    "preset.lowMass": "Pienimassainen t\xE4hti",
    "preset.highMass": "Suurimassainen t\xE4hti",
    "hud.pause": "Keskeyt\xE4",
    "hud.resume": "Jatka",
    "hud.rewind": "Kelaa taaksep\xE4in",
    "hud.rewindStop": "Lopeta kelaus",
    "hud.reset": "Nollaa",
    "hud.timeScale": "Aikaskaala",
    "hud.zoomIn": "L\xE4henn\xE4",
    "hud.zoomOut": "Loitonna",
    "hud.focus": "Kohdista",
    "hud.focus.star": "T\xE4hti",
    "hud.focus.none": "Vapaa kamera",
    "hud.stage": "Vaihe: {stage}",
    "hud.bodyCount": "{count, plural, =0 {Ei kiert\xE4vi\xE4 kappaleita} one {# kiert\xE4v\xE4 kappale} other {# kiert\xE4v\xE4\xE4 kappaletta}}",
    "hud.elapsed": "Kulunut: {time}",
    "hud.speed": "{value} sekunnissa",
    "time.year": "{count, plural, one {vuosi} other {vuotta}}",
    "time.plain": "{number} {unit}",
    "time.scaled": "{number} {scale} {unit}",
    "time.lessThanOne": "alle 1 {unit}",
    "time.scale.million": "miljoonaa",
    "time.scale.billion": "miljardia",
    "time.scale.trillion": "biljoonaa",
    "stage.dustCloud": "P\xF6lypilvi",
    "stage.protostarCoalescence": "Protot\xE4hti muodostuu",
    "stage.fusionIgnition": "Fuusion syttyminen",
    "stage.mainSequence": "P\xE4\xE4sarja",
    "stage.redGiant": "Punainen j\xE4ttil\xE4inen",
    "stage.death": "Kuolema",
    "stage.remnant": "J\xE4\xE4nn\xF6s",
    "remnant.whiteDwarf": "valkoinen k\xE4\xE4pi\xF6",
    "remnant.neutronStar": "neutronit\xE4hti",
    "remnant.pulsar": "pulsari",
    "body.protoplanet": "protoplaneetta",
    "body.planet": "planeetta",
    "body.comet": "komeetta",
    "body.asteroid": "asteroidi",
    "hud.focus.body": "{body} #{id}",
    "event.collapseOnset": "P\xF6lypilvi alkaa luhistua oman painovoimansa vaikutuksesta.",
    "event.protostarFormed": "Pilven keskelle on muodostunut protot\xE4hti.",
    "event.fusionIgnition": "Ydinfuusio on syttynyt \u2014 t\xE4hti on syntynyt!",
    "event.planetFormed": "Ymp\xE4r\xF6iv\xE4st\xE4 kiekosta on tiivistynyt planeetta.",
    "event.redGiantOnset": "T\xE4hti paisuu punaiseksi j\xE4ttil\xE4iseksi ytimen polttoaineen ehtyess\xE4.",
    "event.deathEvent": "T\xE4hti saavuttaa el\xE4m\xE4ns\xE4 lopun.",
    "event.remnantFormed": "T\xE4hdest\xE4 j\xE4\xE4 j\xE4ljelle {remnant}.",
    "event.bodyCaptured": "Vieraileva {body} on siepattu kiertoradalle.",
    "event.bodyEjected": "{body} on sinkoutunut ulos t\xE4htij\xE4rjestelm\xE4st\xE4.",
    "menu.centerOn": "Keskit\xE4 kohteeseen {target}",
    "info.heading": "Mik\xE4 t\xE4m\xE4 on?",
    "info.close": "Sulje",
    "info.protostar.title": "Protot\xE4hti",
    "info.protostar.desc": "Tihe\xE4 ja kuuma kaasu- ja p\xF6lykasauma luhistuvan pilven ytimess\xE4. Se ei ole viel\xE4 varsinainen t\xE4hti \u2014 ydinfuusio ei ole viel\xE4 alkanut.",
    "info.mainSequenceStar.title": "P\xE4\xE4sarjan t\xE4hti",
    "info.mainSequenceStar.desc": "Vakaa t\xE4hti, joka fuusioi vety\xE4 heliumiksi ytimess\xE4\xE4n. Fuusion ulosp\xE4in ty\xF6nt\xE4v\xE4 voima tasapainottaa painovoiman, ja t\xE4hti loistaa tasaisesti suurimman osan el\xE4m\xE4st\xE4\xE4n.",
    "info.redGiant.title": "Punainen j\xE4ttil\xE4inen",
    "info.redGiant.desc": "Ik\xE4\xE4ntyv\xE4 t\xE4hti, jonka ytimen vety on ehtym\xE4ss\xE4. Sen ulkokerrokset ovat paisuneet valtavasti ja j\xE4\xE4htyneet punaisiksi.",
    "info.dyingStar.title": "Kuoleva t\xE4hti",
    "info.dyingStar.desc": "T\xE4hti luo tai r\xE4j\xE4ytt\xE4\xE4 pois ulkokerroksensa paljastaen kuuman ytimen, josta tulee tiivis j\xE4\xE4nn\xF6s.",
    "info.whiteDwarf.title": "Valkoinen k\xE4\xE4pi\xF6",
    "info.whiteDwarf.desc": "Maan kokoinen, j\xE4\xE4htyv\xE4 ydin, jonka pieni- tai keskimassainen t\xE4hti j\xE4tt\xE4\xE4 j\xE4lkeens\xE4. Uskomattoman tihe\xE4 \u2014 teelusikallinen painaisi tonneja.",
    "info.neutronStar.title": "Neutronit\xE4hti",
    "info.neutronStar.desc": "Massiivisen t\xE4hden luhistunut ydin supernovan j\xE4lkeen, l\xE4hes kokonaan neutroneista. Koko t\xE4hden massa pakattuna kaupungin kokoiseen palloon.",
    "info.pulsar.title": "Pulsari",
    "info.pulsar.desc": "Nopeasti py\xF6riv\xE4 neutronit\xE4hti, joka lakaisee s\xE4teilykeiloja avaruuteen kuin majakka ja n\xE4ytt\xE4\xE4 sykkiv\xE4n.",
    "info.rockyPlanet.title": "Kiviplaneetta",
    "info.rockyPlanet.desc": "Pieni, tihe\xE4 maailma, joka koostuu kivest\xE4 ja metallista, kuten Maa tai Mars. Se muodostui kiinteist\xE4 hiukkasista sisemm\xE4ss\xE4 kiekossa.",
    "info.gasGiant.title": "Kaasuplaneetta",
    "info.gasGiant.desc": "Suuri planeetta, joka koostuu enimm\xE4kseen vety- ja heliumkaasusta pienen ytimen ymp\xE4rill\xE4, kuten Jupiter tai Saturnus. Se muodostui kylmemm\xE4ss\xE4 ulkokiekossa.",
    "info.asteroid.title": "Asteroidi",
    "info.asteroid.desc": "Pieni kivinen kappale, planeettojen synnyn j\xE4\xE4nn\xF6spala, joka ajelehtii j\xE4rjestelm\xE4n halki.",
    "info.comet.title": "Komeetta",
    "info.comet.desc": "J\xE4inen kappale, jolle kasvaa hehkuva pyrst\xF6 sen l\xE4hestyess\xE4 t\xE4hte\xE4 ja j\xE4iden h\xF6yrystyess\xE4. Pyrst\xF6 osoittaa aina poisp\xE4in t\xE4hdest\xE4.",
    "info.note.captured": "Se on siepattu vakaalle kiertoradalle t\xE4hden ymp\xE4rille.",
    "info.note.passing": "Se on vain ohikulkumatkalla ja saattaa paeta j\xE4rjestelm\xE4st\xE4 j\xE4lleen.",
    "info.protoplanet.title": "Protoplaneetta",
    "label.stat.mass": "Massa",
    "label.stat.coreTemp": "Ytimen l\xE4mp\xF6tila",
    "label.stat.surfaceTemp": "Pintal\xE4mp\xF6tila",
    "label.stat.velocity": "Ratanopeus",
    "label.stat.distance": "Et\xE4isyys",
    "hud.labels": "N\xE4yt\xE4 nimikkeet",
    "event.bodyConsumed": "Planeetta on kiertynyt t\xE4hteen ja repeytynyt kappaleiksi.",
    "hud.orbits": "N\xE4yt\xE4 radat",
    "info.iceGiant.title": "Jaattilaisplaneetta (jaa)",
    "info.iceGiant.desc": "Vedesta, ammoniakista ja metaanijaasta koostuva maailma kivisen ytimen ymparilla, kuten Uranus tai Neptunus. Se syntyi lumirajan takana mutta liian kaukana kaapatakseen paljon kaasua."
  }, cc = "en";
  class Th {
    constructor(t = cc) {
      this.defaultLocale = t;
    }
    catalogs = /* @__PURE__ */ new Map();
    pluralRulesCache = /* @__PURE__ */ new Map();
    register(t, e) {
      return this.catalogs.set(t, e), this;
    }
    hasLocale(t) {
      return this.catalogs.has(t);
    }
    locales() {
      return [
        ...this.catalogs.keys()
      ];
    }
    translate(t, e, n = {}) {
      const s = this.lookup(t, e);
      return s === void 0 ? e : hc(s, n, this.resolveFormatLocale(t, e));
    }
    lookup(t, e) {
      const s = this.catalogs.get(t)?.[e];
      if (s !== void 0) return s;
      if (t !== this.defaultLocale) return this.catalogs.get(this.defaultLocale)?.[e];
    }
    resolveFormatLocale(t, e) {
      return this.catalogs.get(t)?.[e] !== void 0 ? t : this.defaultLocale;
    }
    pluralRules(t) {
      let e = this.pluralRulesCache.get(t);
      return e || (e = new Intl.PluralRules(t), this.pluralRulesCache.set(t, e)), e;
    }
  }
  function hc(i, t, e) {
    let n = "", s = 0;
    for (; s < i.length; ) {
      const r = i[s];
      if (r === "{") {
        const a = uc(i, s);
        if (a === -1) {
          n += i.slice(s);
          break;
        }
        n += Ah(i.slice(s + 1, a), t, e), s = a + 1;
      } else n += r, s += 1;
    }
    return n;
  }
  function uc(i, t) {
    let e = 0;
    for (let n = t; n < i.length; n += 1) {
      const s = i[n];
      if (s === "{") e += 1;
      else if (s === "}" && (e -= 1, e === 0)) return n;
    }
    return -1;
  }
  function Ah(i, t, e) {
    const n = i.indexOf(",");
    if (n === -1) return ho(i.trim(), t);
    const s = i.slice(0, n).trim(), r = i.indexOf(",", n + 1);
    return (r === -1 ? i.slice(n + 1) : i.slice(n + 1, r)).trim() === "plural" && r !== -1 ? wh(s, i.slice(r + 1), t, e) : ho(s, t);
  }
  function ho(i, t) {
    const e = t[i];
    return e === void 0 ? `{${i}}` : String(e);
  }
  function wh(i, t, e, n) {
    const s = e[i], r = typeof s == "number" ? s : Number(s), a = Ch(t), o = a.get(`=${r}`), l = Number.isFinite(r) ? new Intl.PluralRules(n).select(r) : "other", h = (o ?? a.get(l) ?? a.get("other") ?? "").replace(/#/g, String(r));
    return hc(h, e, n);
  }
  function Ch(i) {
    const t = /* @__PURE__ */ new Map();
    let e = 0;
    for (; e < i.length; ) {
      for (; e < i.length && /\s/.test(i[e]); ) e += 1;
      if (e >= i.length) break;
      const n = i.indexOf("{", e);
      if (n === -1) break;
      const s = i.slice(e, n).trim(), r = uc(i, n);
      if (r === -1) break;
      s && t.set(s, i.slice(n + 1, r)), e = r + 1;
    }
    return t;
  }
  const uo = {
    en: Eh,
    fi: bh
  }, Yn = new Th(cc).register("en", uo.en).register("fi", uo.fi);
  function Rh(i) {
    const t = {
      locale: i.locale,
      composition: yh(i.composition),
      mass: i.mass,
      cloudExtent: i.cloudExtent,
      pace: Math.min(1, Math.max(0, i.pace)),
      showEventAnnotations: i.showEventAnnotations,
      presetId: i.presetId
    };
    return Object.freeze(t);
  }
  const Ph = [
    "en",
    "fi"
  ];
  class Dh {
    i18n;
    onSubmit;
    root;
    locale;
    presetId;
    localeSelect;
    presetSelect;
    massInput;
    extentInput;
    hydrogenInput;
    heliumInput;
    metalsInput;
    paceInput;
    showEventsInput;
    translatables = /* @__PURE__ */ new Map();
    valueUpdaters = [];
    constructor(t) {
      this.i18n = t.i18n ?? Yn, this.onSubmit = t.onSubmit, this.locale = t.initialLocale ?? "en", this.presetId = t.initialPresetId ?? Vr;
      const e = zi[this.presetId] ?? zi[Vr];
      if (!e) throw new Error("No presets are registered.");
      this.root = document.createElement("form"), this.root.className = "setup-form", this.appendHeading("setup.heading", "h1"), this.appendSubtitle("app.subtitle"), this.localeSelect = this.appendSelect("setup.language", Ph.map((a) => ({
        value: a,
        labelId: `setup.language.${a}`
      })), this.locale), this.presetSelect = this.appendSelect("setup.preset", Object.values(zi).map((a) => ({
        value: a.id,
        labelId: a.nameMessageId
      })), this.presetId);
      const n = (a) => `${a.toFixed(1)} M\u2609`, s = (a) => `${Math.round(a)} AU`, r = (a) => `${Math.round(a * 100)}%`;
      this.massInput = this.appendRange("setup.mass", 0.1, 40, 0.1, e.mass, {
        format: n
      }), this.extentInput = this.appendRange("setup.cloudExtent", 10, 150, 1, e.cloudExtent, {
        format: s
      }), this.appendHeading("setup.composition", "h2"), this.hydrogenInput = this.appendRange("setup.composition.hydrogen", 0, 1, 0.01, e.composition.hydrogen, {
        format: r
      }), this.heliumInput = this.appendRange("setup.composition.helium", 0, 1, 0.01, e.composition.helium, {
        format: r
      }), this.metalsInput = this.appendRange("setup.composition.metals", 0, 0.2, 5e-3, e.composition.metals, {
        format: r
      }), this.appendHint("setup.composition.hint"), this.paceInput = this.appendRange("setup.pace", 0, 1, 0.01, e.pace, {
        minLabelId: "setup.pace.slow",
        maxLabelId: "setup.pace.fast"
      }), this.showEventsInput = this.appendCheckbox("setup.showEvents", false), this.appendSubmit("setup.start"), this.localeSelect.addEventListener("change", () => {
        this.locale = this.localeSelect.value, this.applyTranslations();
      }), this.presetSelect.addEventListener("change", () => {
        this.applyPreset(this.presetSelect.value);
      }), this.root.addEventListener("submit", (a) => {
        a.preventDefault(), this.onSubmit(this.readConfig());
      }), this.applyTranslations(), t.container.appendChild(this.root);
    }
    get element() {
      return this.root;
    }
    readConfig() {
      return Rh(this.readState());
    }
    readState() {
      return {
        locale: this.localeSelect.value,
        presetId: this.presetId,
        mass: Number(this.massInput.value),
        cloudExtent: Number(this.extentInput.value),
        pace: Number(this.paceInput.value),
        composition: {
          hydrogen: Number(this.hydrogenInput.value),
          helium: Number(this.heliumInput.value),
          metals: Number(this.metalsInput.value)
        },
        showEventAnnotations: this.showEventsInput.checked
      };
    }
    applyPreset(t) {
      const e = zi[t];
      if (e) {
        this.presetId = e.id, this.presetSelect.value = e.id, this.massInput.value = String(e.mass), this.extentInput.value = String(e.cloudExtent), this.hydrogenInput.value = String(e.composition.hydrogen), this.heliumInput.value = String(e.composition.helium), this.metalsInput.value = String(e.composition.metals), this.paceInput.value = String(e.pace);
        for (const n of this.valueUpdaters) n();
      }
    }
    applyTranslations() {
      for (const [t, e] of this.translatables) t.textContent = this.t(e);
      for (const t of this.localeSelect.options) t.textContent = this.t(`setup.language.${t.value}`);
      for (const t of this.presetSelect.options) {
        const e = zi[t.value];
        e && (t.textContent = this.t(e.nameMessageId));
      }
    }
    t(t) {
      return this.i18n.translate(this.locale, t);
    }
    appendHeading(t, e) {
      const n = document.createElement(e);
      this.translatables.set(n, t), this.root.appendChild(n);
    }
    appendHint(t) {
      const e = document.createElement("p");
      e.className = "setup-hint", this.translatables.set(e, t), this.root.appendChild(e);
    }
    appendSelect(t, e, n) {
      const s = this.field(t), r = document.createElement("select");
      for (const a of e) {
        const o = document.createElement("option");
        o.value = a.value, o.textContent = this.t(a.labelId), r.appendChild(o);
      }
      return r.value = n, s.appendChild(r), r;
    }
    appendRange(t, e, n, s, r, a) {
      const o = this.field(t), l = document.createElement("input");
      if (l.type = "range", l.min = String(e), l.max = String(n), l.step = String(s), l.value = String(r), o.appendChild(l), a?.format) {
        const c = a.format, h = document.createElement("output");
        h.className = "setup-value";
        const d = () => {
          h.textContent = c(Number(l.value));
        };
        l.addEventListener("input", d), this.valueUpdaters.push(d), d(), o.appendChild(h);
      }
      if (a?.minLabelId && a?.maxLabelId) {
        const c = document.createElement("div");
        c.className = "setup-scale";
        const h = document.createElement("span"), d = document.createElement("span");
        this.translatables.set(h, a.minLabelId), this.translatables.set(d, a.maxLabelId), c.append(h, d), o.appendChild(c);
      }
      return l;
    }
    appendSubtitle(t) {
      const e = document.createElement("p");
      e.className = "setup-subtitle", this.translatables.set(e, t), this.root.appendChild(e);
    }
    appendCheckbox(t, e) {
      const n = document.createElement("label");
      n.className = "setup-field setup-field--checkbox";
      const s = document.createElement("input");
      s.type = "checkbox", s.checked = e;
      const r = document.createElement("span");
      return this.translatables.set(r, t), n.append(s, r), this.root.appendChild(n), s;
    }
    appendSubmit(t) {
      const e = document.createElement("button");
      e.type = "submit", this.translatables.set(e, t), this.root.appendChild(e);
    }
    field(t) {
      const e = document.createElement("label");
      e.className = "setup-field";
      const n = document.createElement("span");
      return n.className = "setup-field__label", this.translatables.set(n, t), e.appendChild(n), this.root.appendChild(e), e;
    }
    destroy() {
      this.root.remove();
    }
  }
  var X = ((i) => (i[i.DustCloud = 0] = "DustCloud", i[i.ProtostarCoalescence = 1] = "ProtostarCoalescence", i[i.FusionIgnition = 2] = "FusionIgnition", i[i.MainSequence = 3] = "MainSequence", i[i.RedGiant = 4] = "RedGiant", i[i.Death = 5] = "Death", i[i.Remnant = 6] = "Remnant", i))(X || {}), he = ((i) => (i[i.WhiteDwarf = 0] = "WhiteDwarf", i[i.NeutronStar = 1] = "NeutronStar", i[i.Pulsar = 2] = "Pulsar", i))(he || {});
  const dc = {
    supernovaMinMass: 8,
    pulsarMinMass: 12,
    solarMetallicity: 0.02,
    metalsMassLossCoefficient: 1.5
  };
  function Ih(i, t) {
    const { metalsMassLossCoefficient: e, solarMetallicity: n } = dc, s = t.metals - n, r = 1 - e * s;
    return Math.max(0, i * r);
  }
  function Lh(i, t) {
    const e = Ih(i, t), { supernovaMinMass: n, pulsarMinMass: s } = dc;
    return e < n ? {
      supernova: false,
      remnant: 0
    } : e >= s ? {
      supernova: true,
      remnant: 2
    } : {
      supernova: true,
      remnant: 1
    };
  }
  const fc = {
    determineFate: Lh
  }, xi = 7, Pe = {
    x: 0,
    y: 1,
    z: 2,
    r: 3,
    g: 4,
    b: 5,
    size: 6
  }, Ke = 12, Tt = {
    id: 0,
    type: 1,
    mass: 2,
    radius: 3,
    x: 4,
    y: 5,
    z: 6,
    vx: 7,
    vy: 8,
    vz: 9,
    spin: 10,
    captured: 11
  };
  var wt = ((i) => (i[i.Protoplanet = 0] = "Protoplanet", i[i.Planet = 1] = "Planet", i[i.Comet = 2] = "Comet", i[i.Asteroid = 3] = "Asteroid", i))(wt || {});
  const Uh = 365.25 * 24 * 3600;
  function fo(i) {
    return Number.isFinite(i) ? i / Uh : 0;
  }
  const Nh = [
    {
      threshold: 1e12,
      scaleId: "time.scale.trillion"
    },
    {
      threshold: 1e9,
      scaleId: "time.scale.billion"
    },
    {
      threshold: 1e6,
      scaleId: "time.scale.million"
    }
  ], po = /* @__PURE__ */ new Map();
  function mo(i, t) {
    const e = `${i}:${t}`;
    let n = po.get(e);
    return n || (n = new Intl.NumberFormat(i, {
      maximumFractionDigits: t
    }), po.set(e, n)), n;
  }
  function go(i, t, e) {
    const n = Number.isFinite(i) && i > 0 ? i : 0, s = Nh.find((a) => n >= a.threshold);
    if (s) {
      const a = n / s.threshold, o = mo(e, a < 100 ? 1 : 0).format(a);
      return t.translate(e, "time.scaled", {
        number: o,
        scale: t.translate(e, s.scaleId),
        unit: t.translate(e, "time.year", {
          count: 2
        })
      });
    }
    const r = Math.round(n);
    return r === 0 && n > 0 ? t.translate(e, "time.lessThanOne", {
      unit: t.translate(e, "time.year", {
        count: 1
      })
    }) : t.translate(e, "time.plain", {
      number: mo(e, 0).format(r),
      unit: t.translate(e, "time.year", {
        count: r
      })
    });
  }
  var oe = ((i) => (i[i.CollapseOnset = 0] = "CollapseOnset", i[i.ProtostarFormed = 1] = "ProtostarFormed", i[i.FusionIgnition = 2] = "FusionIgnition", i[i.PlanetFormed = 3] = "PlanetFormed", i[i.RedGiantOnset = 4] = "RedGiantOnset", i[i.DeathEvent = 5] = "DeathEvent", i[i.RemnantFormed = 6] = "RemnantFormed", i[i.BodyCaptured = 7] = "BodyCaptured", i[i.BodyEjected = 8] = "BodyEjected", i[i.BodyConsumed = 9] = "BodyConsumed", i))(oe || {});
  const Fh = {
    0: "event.collapseOnset",
    1: "event.protostarFormed",
    2: "event.fusionIgnition",
    3: "event.planetFormed",
    4: "event.redGiantOnset",
    5: "event.deathEvent",
    6: "event.remnantFormed",
    7: "event.bodyCaptured",
    8: "event.bodyEjected",
    9: "event.bodyConsumed"
  };
  function pc(i) {
    return Fh[i];
  }
  function _o(i, t, e) {
    const n = {
      type: i,
      simTime: t,
      messageId: pc(i)
    };
    return e !== void 0 && (n.data = e), n;
  }
  class Oh {
    listeners = /* @__PURE__ */ new Set();
    queue = [];
    subscribe(t) {
      return this.listeners.add(t), () => {
        this.listeners.delete(t);
      };
    }
    emit(t) {
      const e = {
        ...t,
        messageId: t.messageId ?? pc(t.type)
      };
      this.queue.push(e);
      for (const n of this.listeners) n(e);
      return e;
    }
    get pending() {
      return this.queue.length;
    }
    drain() {
      const t = this.queue;
      return this.queue = [], t;
    }
    clear() {
      this.queue = [], this.listeners.clear();
    }
  }
  const mc = 1, Bh = 332946, zh = 465047e-8, kh = 157e5, Hh = 29.78;
  function Fa(i) {
    return Math.max(0, i) / mc;
  }
  function Gh(i) {
    return Math.max(0, i) * mc;
  }
  function gc(i) {
    return Math.max(0, i) * Bh;
  }
  function Vh(i, t) {
    return !(t > 0) || !(i > 0) ? 0 : Hh * Math.sqrt(i / t);
  }
  function Wh(i) {
    const t = Math.max(i, 1e-3);
    return Math.pow(t, 0.8);
  }
  function Xh(i, t, e, n = 0) {
    if (!(e > 0) || !(i > 0) || !(t > 0)) return 0;
    const s = t * zh, r = Math.min(Math.max(n, 0), 0.99);
    return i * Math.sqrt(s / (2 * e)) * Math.pow(1 - r, 0.25);
  }
  function qh(i, t, e = null) {
    const n = Math.max(t, 1e-3), s = kh * Math.pow(n, 0.55);
    switch (i) {
      case X.DustCloud:
        return 20;
      case X.ProtostarCoalescence:
        return 3e6;
      case X.FusionIgnition:
        return 1e7;
      case X.MainSequence:
        return s;
      case X.RedGiant:
        return Math.max(1e8, s * 6);
      case X.Death:
        return Math.max(3e8, s * 20);
      case X.Remnant:
        switch (e) {
          case he.NeutronStar:
          case he.Pulsar:
            return 1e9;
          case he.WhiteDwarf:
          default:
            return 1e7;
        }
      default:
        return s;
    }
  }
  const _c = 365.25 * 24 * 3600, ls = 1e6 * _c;
  X.DustCloud, X.ProtostarCoalescence, X.FusionIgnition, X.MainSequence, X.RedGiant, X.Death, X.Remnant;
  const vo = {
    [X.ProtostarCoalescence]: oe.CollapseOnset,
    [X.FusionIgnition]: oe.ProtostarFormed,
    [X.MainSequence]: oe.FusionIgnition,
    [X.RedGiant]: oe.RedGiantOnset,
    [X.Death]: oe.DeathEvent,
    [X.Remnant]: oe.RemnantFormed
  }, Yh = {
    dustCloudSeconds: 1 * ls,
    protostarBaseSeconds: 0.5 * ls,
    fusionIgnitionSeconds: 0.1 * ls,
    mainSequenceSolarSeconds: 1e10 * _c,
    redGiantFractionOfMain: 0.1,
    deathSeconds: 0.01 * ls,
    solarMetallicity: 0.02,
    metallicityLifetimeCoefficient: 2
  };
  function xo(i, t) {
    const e = Math.max(i, Number.EPSILON), { dustCloudSeconds: n, protostarBaseSeconds: s, fusionIgnitionSeconds: r, mainSequenceSolarSeconds: a, redGiantFractionOfMain: o, deathSeconds: l, solarMetallicity: c, metallicityLifetimeCoefficient: h } = Yh, d = t.metals - c, f = Math.max(0.1, 1 - h * d), p = a * Math.pow(e, -2.5) * f;
    return {
      [X.DustCloud]: n,
      [X.ProtostarCoalescence]: s * Math.pow(e, -0.5),
      [X.FusionIgnition]: r,
      [X.MainSequence]: p,
      [X.RedGiant]: p * o,
      [X.Death]: l,
      [X.Remnant]: 1 / 0
    };
  }
  const jh = 1, ki = 0.35, nr = 4e3, Mo = 16, So = 1 / 60, Kh = 110, Zh = 2e4, $h = 0.03, Jh = 0.2, yo = 1.8, Qh = 2.6, tu = 0.28, ir = 12, Eo = 2.7, bo = 1e-4, eu = 0.02, nu = 7, iu = 0.02, cs = 0.1, hs = 0.3, To = 0.5, su = 55e-4, Ao = 8e15, ru = 10, wo = 0.04, Co = 1e-5;
  function au(i) {
    if (!(i > 0)) return 0;
    if (i < Eo) return bo;
    const t = Math.exp(-(i - Eo) / nu);
    return bo + eu * t;
  }
  const ou = 0.6, lu = 4e-3, cu = 0.016, hu = 8e-3, uu = 6e-3, du = 2.4, fu = 1200, pu = 140, mu = 6, gu = 0.6, _u = 1.25, vu = 2.2, xu = 2.6, sr = {
    hydrogen: [
      0.45,
      0.6,
      1
    ],
    helium: [
      0.85,
      0.88,
      1
    ],
    metals: [
      1,
      0.62,
      0.32
    ]
  };
  function Ro(i) {
    let t = i >>> 0;
    return () => {
      t += 1831565813;
      let e = t;
      return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
    };
  }
  function Mu(i) {
    const t = [
      i.mass,
      i.cloudExtent,
      i.pace,
      i.composition.hydrogen,
      i.composition.helium,
      i.composition.metals
    ];
    let e = 2166136261;
    for (const n of t) {
      const s = Math.trunc(n * 1e6) >>> 0;
      e = Math.imul(e ^ s & 65535, 16777619), e = Math.imul(e ^ s >>> 16, 16777619);
    }
    return e >>> 0;
  }
  function vc(i) {
    return jh * Kh * Math.sqrt(Math.max(i, Number.EPSILON));
  }
  function Vn(i) {
    return Math.hypot(i[0], i[1], i[2]);
  }
  function Su(i, t) {
    const e = Vn(i);
    if (!(e > 0)) return [
      1,
      0,
      0
    ];
    const n = [
      i[0] / e,
      i[1] / e,
      i[2] / e
    ], s = Math.abs(n[1]) < 0.9 ? [
      0,
      1,
      0
    ] : [
      1,
      0,
      0
    ], r = [
      n[1] * s[2] - n[2] * s[1],
      n[2] * s[0] - n[0] * s[2],
      n[0] * s[1] - n[1] * s[0]
    ], a = Vn(r);
    if (!(a > 0)) return [
      1,
      0,
      0
    ];
    const o = [
      r[0] / a,
      r[1] / a,
      r[2] / a
    ], l = [
      n[1] * o[2] - n[2] * o[1],
      n[2] * o[0] - n[0] * o[2],
      n[0] * o[1] - n[1] * o[0]
    ], c = Math.cos(t), h = Math.sin(t);
    return [
      o[0] * c + l[0] * h,
      o[1] * c + l[1] * h,
      o[2] * c + l[2] * h
    ];
  }
  function xc(i, t, e) {
    const n = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], s = Math.pow(n + t * t, 1.5), r = s > 0 ? -i / s : 0;
    return [
      e[0] * r,
      e[1] * r,
      e[2] * r
    ];
  }
  function yu(i, t, e) {
    const n = Math.max(t, Number.EPSILON);
    return 0.5 * e * e - i / n;
  }
  function Eu(i, t, e) {
    return yu(i, t, e) < 0;
  }
  function Po(i, t, e) {
    const n = Math.pow(e * e + t * t, 1.5);
    return n > 0 ? Math.sqrt(i * e * e / n) : 0;
  }
  function bu(i, t, e, n, s) {
    const r = xc(e, n, i), a = [
      t[0] + r[0] * s,
      t[1] + r[1] * s,
      t[2] + r[2] * s
    ];
    return {
      pos: [
        i[0] + a[0] * s,
        i[1] + a[1] * s,
        i[2] + a[2] * s
      ],
      vel: a
    };
  }
  function Tu(i) {
    if (!Number.isFinite(i) || i <= 0) return 0;
    const t = $h * Math.log(1 + i / Zh);
    return Math.min(Jh, Math.max(0, t));
  }
  function Au(i, t) {
    const e = Math.max(t, Number.EPSILON);
    return 0.4 + 1.2 * Math.cbrt(Math.max(i, 0) / e);
  }
  function rr(i, t) {
    const e = Math.max(t * 1e-3, Number.EPSILON), n = 35e-4 + 0.011 * Math.cbrt(Math.max(i, 0) / e);
    return Math.min(cu, Math.max(lu, n));
  }
  function Do(i, t) {
    const e = Math.max(t * 1e-3, Number.EPSILON), n = 0.026 + 0.085 * Math.cbrt(Math.max(i, 0) / e);
    return Math.min(0.12, Math.max(0.03, n));
  }
  function wu(i, t, e, n) {
    const s = i + e;
    return s <= 0 ? [
      0,
      0,
      0
    ] : [
      (i * t[0] + e * n[0]) / s,
      (i * t[1] + e * n[1]) / s,
      (i * t[2] + e * n[2]) / s
    ];
  }
  function Cu(i, t, e, n) {
    const s = Vn(t), r = Vn(e);
    if (Eu(i, s, r)) return "captured";
    const a = s > 0 ? (t[0] * e[0] + t[1] * e[1] + t[2] * e[2]) / s : 0;
    return s >= n && a > 0 ? "ejected" : "transit";
  }
  class Io {
    bus = new Oh();
    config = null;
    rng = Ro(1);
    particles = [];
    bodies = [];
    particleBuffer = new Float32Array(0);
    bodyBuffer = new Float32Array(0);
    cloudExtent = 50;
    cloudMass = 1;
    coreMass = 0;
    discReservoir = 0;
    coreAccretionRadius = 3;
    bodySwallowRadius = 2;
    ejectRadius = 0;
    simTime = 0;
    nextBodyId = 0;
    spawnAccumulator = 0;
    ejectaDone = false;
    stage = X.DustCloud;
    stellarElapsed = 0;
    durations = xo(1, {
      metals: 0.02
    });
    fate = {
      supernova: false,
      remnant: he.WhiteDwarf
    };
    coreFraction = 0;
    formationDuration = 0;
    init(t) {
      const { config: e } = t;
      this.config = e, this.bus.clear(), this.rng = Ro(Mu(e)), this.cloudExtent = e.cloudExtent, this.cloudMass = Math.max(e.mass, Number.EPSILON), this.coreMass = this.cloudMass * wo, this.discReservoir = 0, this.coreAccretionRadius = Math.min(2, Math.max(0.5, e.cloudExtent * 0.02)), this.bodySwallowRadius = this.coreAccretionRadius * ou, this.ejectRadius = e.cloudExtent * 1.5, this.simTime = 0, this.nextBodyId = 0, this.spawnAccumulator = 0, this.ejectaDone = false, this.stage = X.DustCloud, this.stellarElapsed = 0, this.durations = xo(e.mass, e.composition), this.formationDuration = this.durations[X.DustCloud] + this.durations[X.ProtostarCoalescence] + this.durations[X.FusionIgnition], this.fate = fc.determineFate(e.mass, e.composition), this.coreFraction = this.coreMass / this.cloudMass, this.seedParticles(t.particleCount), this.seedPlanetesimals(), this.particleBuffer = new Float32Array(this.particles.length * xi), this.bodyBuffer = new Float32Array(this.bodies.length * Ke), this.writeParticleBuffer(), this.writeBodyBuffer();
    }
    step(t) {
      if (this.config === null) throw new Error("TsFallbackKernel.step called before init");
      if (!Number.isFinite(t) || t <= 0) return {
        events: this.bus.drain(),
        stage: this.stage,
        stageProgress: this.stageProgress(),
        elapsedSimSeconds: this.elapsedSimSeconds()
      };
      this.simTime += t;
      const e = Tu(t);
      if (e > 0) {
        const n = Math.min(Mo, Math.max(1, Math.ceil(e / So))), s = e / n, r = this.stage <= X.FusionIgnition;
        for (let a = 0; a < n; a += 1) this.integrateParticles(s, r), this.integrateBodies(s);
        this.accrete(this.stage, e), this.ageParticles(e);
      }
      return this.coreFraction = this.coreMass / Math.max(this.cloudMass, Number.EPSILON), this.advanceStages(t, this.coreFraction), this.stage >= X.FusionIgnition && this.promotePlanets(), this.stage >= X.Death && !this.ejectaDone && (this.dissipateDiscMaterial(), this.spawnEjecta(), this.ejectaDone = true), this.spawnVisitors(t), this.resolveVisitors(), this.cullParticles(), this.rebuildParticleBuffer(), this.rebuildBodyBuffer(), {
        events: this.bus.drain(),
        stage: this.stage,
        stageProgress: this.stageProgress(),
        elapsedSimSeconds: this.elapsedSimSeconds()
      };
    }
    advanceStages(t, e) {
      if (this.stage === X.DustCloud && e >= cs && (this.stage = X.ProtostarCoalescence, this.emitStageEvent(oe.CollapseOnset)), this.stage === X.ProtostarCoalescence && e >= hs && (this.stage = X.FusionIgnition, this.emitStageEvent(oe.ProtostarFormed)), this.stage === X.FusionIgnition && e >= To && (this.stage = X.MainSequence, this.stellarElapsed = 0, this.emitStageEvent(oe.FusionIgnition)), this.stage >= X.MainSequence && this.stage < X.Remnant && Number.isFinite(t) && t > 0) {
        this.stellarElapsed += t;
        let n = 0;
        for (; n < 8; ) {
          n += 1;
          const s = this.durations[this.stage];
          if (!Number.isFinite(s) || s <= 0 || this.stellarElapsed < s) break;
          if (this.stellarElapsed -= s, this.stage === X.MainSequence) this.stage = X.RedGiant, this.engulfInnerPlanets(), this.emitStageEvent(oe.RedGiantOnset);
          else if (this.stage === X.RedGiant) this.stage = X.Death, this.emitStageEvent(oe.DeathEvent, {
            supernova: this.fate.supernova
          });
          else if (this.stage === X.Death) {
            this.stage = X.Remnant, this.expandOrbitsAfterMassLoss(), this.emitStageEvent(oe.RemnantFormed, {
              remnant: this.fate.remnant,
              supernova: this.fate.supernova
            });
            break;
          } else break;
        }
      }
    }
    emitStageEvent(t, e) {
      e === void 0 ? this.bus.emit({
        type: t,
        simTime: this.simTime
      }) : this.bus.emit({
        type: t,
        simTime: this.simTime,
        data: e
      });
    }
    elapsedSimSeconds() {
      const t = this.durations;
      switch (this.stage) {
        case X.DustCloud:
          return t[X.DustCloud] * this.stageProgress();
        case X.ProtostarCoalescence:
          return t[X.DustCloud] + t[X.ProtostarCoalescence] * this.stageProgress();
        case X.FusionIgnition:
          return t[X.DustCloud] + t[X.ProtostarCoalescence] + t[X.FusionIgnition] * this.stageProgress();
        default:
          return this.formationDuration + this.stellarElapsedTotal();
      }
    }
    stellarElapsedTotal() {
      const t = this.durations;
      let e = 0;
      return this.stage > X.MainSequence && (e += t[X.MainSequence]), this.stage > X.RedGiant && (e += t[X.RedGiant]), this.stage > X.Death && (e += t[X.Death]), e + this.stellarElapsed;
    }
    stageProgress() {
      const t = (e) => Math.min(1, Math.max(0, e));
      switch (this.stage) {
        case X.DustCloud:
          return t(this.coreFraction / cs);
        case X.ProtostarCoalescence:
          return t((this.coreFraction - cs) / (hs - cs));
        case X.FusionIgnition:
          return t((this.coreFraction - hs) / (To - hs));
        case X.MainSequence:
        case X.RedGiant:
        case X.Death: {
          const e = this.durations[this.stage];
          return Number.isFinite(e) && e > 0 ? t(this.stellarElapsed / e) : 1;
        }
        default:
          return 1;
      }
    }
    getParticleBuffer() {
      return this.particleBuffer;
    }
    getBodyBuffer() {
      return this.bodyBuffer;
    }
    dispose() {
      this.bus.clear(), this.particles = [], this.bodies = [], this.particleBuffer = new Float32Array(0), this.bodyBuffer = new Float32Array(0), this.config = null;
    }
    get mu() {
      return vc(this.cloudMass);
    }
    get captureRadius() {
      const t = Math.sqrt(this.mu) * So;
      return Math.max(this.coreAccretionRadius, 2 * t);
    }
    seedParticles(t) {
      const e = this.config;
      if (e === null) return;
      const n = Math.max(0, Math.min(Math.floor(t), nr)), s = this.cloudExtent, r = this.speciesCumulative(e.composition), a = this.mu, o = this.cloudMass * (1 - wo - ir * Co), l = n > 0 ? Math.max(o / n, 0) : 0;
      this.particles = [];
      for (let c = 0; c < n; c += 1) {
        const h = s * (0.04 + 0.56 * this.rng()), d = 2 * Math.PI * this.rng(), f = h * Math.cos(d), p = h * Math.sin(d), g = (this.rng() - 0.5) * s * 0.45, v = Po(a, ki, Math.max(h, ki)), m = v * (0.45 + 0.15 * this.rng()), u = v * 0.05, [b, E, S, N] = this.speciesColorSize(r);
        this.particles.push({
          x: f,
          y: g,
          z: p,
          vx: -p / Math.max(h, 1e-6) * m + (this.rng() - 0.5) * u,
          vy: (this.rng() - 0.5) * u,
          vz: f / Math.max(h, 1e-6) * m + (this.rng() - 0.5) * u,
          r: b,
          g: E,
          b: S,
          size: N,
          mass: l,
          kind: 0,
          ttl: 1 / 0
        });
      }
    }
    seedPlanetesimals() {
      if (this.config === null) return;
      this.bodies = [];
      const t = this.mu, e = Math.max(this.cloudExtent * 0.02, this.coreAccretionRadius * 1.3), n = Math.max(e * 4, this.cloudExtent * 0.8), s = this.cloudMass * Co, r = Math.pow(n / e, 1 / (ir - 1));
      for (let a = 0; a < ir; a += 1) {
        const o = e * Math.pow(r, a) * (0.94 + 0.12 * this.rng()), l = 0.02 + 0.13 * this.rng(), c = (this.rng() - 0.5) * 0.09, h = 2 * Math.PI * this.rng(), d = this.rng() < 0.5, f = Po(t, ki, o) * Math.sqrt(1 + (d ? l : -l)), p = Math.cos(c), g = Math.sin(c), v = [
          o * Math.cos(h),
          o * g,
          o * Math.sin(h) * p
        ], m = [
          -f * Math.sin(h),
          f * g * 0.5,
          f * Math.cos(h) * p
        ];
        this.bodies.push({
          id: this.nextBodyId++,
          type: wt.Protoplanet,
          mass: s,
          radius: rr(s, this.cloudMass),
          position: v,
          velocity: m,
          spin: 0.5 + this.rng(),
          captured: true
        });
      }
    }
    integrateParticles(t, e) {
      const n = this.mu, s = Math.max(0, 1 - yo * t), r = Math.max(0, 1 - Qh * t), a = e ? Math.max(0, 1 - tu * t) : 1, o = Math.max(0, 1 - gu * t);
      for (const l of this.particles) {
        const c = xc(n, ki, [
          l.x,
          l.y,
          l.z
        ]), h = l.kind === 0, d = h ? a : l.kind === 1 ? o : 1;
        l.vx = (l.vx + c[0] * t) * d, l.vy = (l.vy + c[1] * t) * (h ? s : d), l.vz = (l.vz + c[2] * t) * d, l.x += l.vx * t, l.y = (h ? l.y * r : l.y) + l.vy * t, l.z += l.vz * t;
      }
    }
    ageParticles(t) {
      let e = false;
      for (const n of this.particles) Number.isFinite(n.ttl) && (n.ttl -= t, n.ttl <= 0 && (e = true));
      e && (this.particles = this.particles.filter((n) => n.ttl > 0));
    }
    integrateBodies(t) {
      const e = this.mu, n = Math.max(0, 1 - yo * iu * t);
      for (const s of this.bodies) {
        const r = bu(s.position, s.velocity, e, ki, t);
        (s.type === wt.Protoplanet || s.type === wt.Planet) && (r.vel[1] *= n), s.position = r.pos, s.velocity = r.vel;
      }
    }
    accrete(t, e) {
      const n = this.cloudMass, s = [], r = this.captureRadius, a = r * r;
      let o = su * n * Math.max(e, 0);
      const l = Math.min(this.discReservoir, o);
      this.discReservoir -= l, this.coreMass += l, o -= l;
      const c = this.bodies.map((h) => h.type === wt.Protoplanet || h.type === wt.Planet ? Au(h.mass, n) ** 2 : -1);
      for (const h of this.particles) {
        if (h.x * h.x + h.y * h.y + h.z * h.z <= a) {
          if (o >= h.mass) {
            o -= h.mass, this.coreMass += h.mass;
            continue;
          }
          s.push(h);
          continue;
        }
        let f = false;
        for (let p = 0; p < this.bodies.length; p += 1) {
          if (c[p] < 0) continue;
          const g = this.bodies[p], v = h.x - g.position[0], m = h.y - g.position[1], u = h.z - g.position[2];
          if (v * v + m * m + u * u <= c[p]) {
            const b = Math.hypot(g.position[0], g.position[1], g.position[2]), E = h.mass * au(Fa(b));
            g.mass += E, g.radius = rr(g.mass, n), this.discReservoir += h.mass - E, f = true;
            break;
          }
        }
        f || s.push(h);
      }
      this.particles = s, t <= X.MainSequence && this.mergeBodies(), this.swallowBodiesIntoStar();
    }
    engulfInnerPlanets() {
      const t = this.redGiantEngulfRadius(), e = t * t, n = [];
      for (const s of this.bodies) {
        const r = s.type === wt.Planet || s.type === wt.Protoplanet, a = s.position[0] * s.position[0] + s.position[1] * s.position[1] + s.position[2] * s.position[2];
        if (r && a <= e) {
          this.spawnDebris(s), this.coreMass += s.mass, this.bus.emit({
            type: oe.BodyConsumed,
            simTime: this.simTime,
            data: {
              bodyId: s.id,
              bodyType: s.type
            }
          });
          continue;
        }
        n.push(s);
      }
      this.bodies = n;
    }
    redGiantEngulfRadius() {
      return Gh(vu * Math.pow(Math.max(this.cloudMass, 0.1), 0.3));
    }
    expandOrbitsAfterMassLoss() {
      const t = this.fate.supernova ? 0.16 : 0.55, e = Math.min(xu, Math.max(1, 1 / t)), n = 1 / Math.sqrt(e);
      for (const s of this.bodies) if (!(s.type !== wt.Planet && s.type !== wt.Protoplanet) && (s.position = [
        s.position[0] * e,
        s.position[1] * e,
        s.position[2] * e
      ], s.velocity = [
        s.velocity[0] * n,
        s.velocity[1] * n,
        s.velocity[2] * n
      ], this.fate.supernova)) {
        const r = 0.18 * Vn(s.velocity);
        s.velocity[0] += (this.rng() - 0.5) * r, s.velocity[1] += (this.rng() - 0.5) * r, s.velocity[2] += (this.rng() - 0.5) * r;
      }
    }
    swallowBodiesIntoStar() {
      const t = this.bodySwallowRadius * this.bodySwallowRadius, e = [];
      let n = false;
      for (const s of this.bodies) {
        const r = s.position[0], a = s.position[1], o = s.position[2];
        if (r * r + a * a + o * o <= t) {
          this.spawnDebris(s), this.coreMass += s.mass, this.bus.emit({
            type: oe.BodyConsumed,
            simTime: this.simTime,
            data: {
              bodyId: s.id,
              bodyType: s.type
            }
          }), n = true;
          continue;
        }
        e.push(s);
      }
      n && (this.bodies = e);
    }
    mergeBodies() {
      const t = [], e = /* @__PURE__ */ new Set();
      for (let n = 0; n < this.bodies.length; n += 1) {
        const s = this.bodies[n];
        if (!e.has(s.id)) {
          if (s.type !== wt.Protoplanet && s.type !== wt.Planet) {
            t.push(s);
            continue;
          }
          for (let r = n + 1; r < this.bodies.length; r += 1) {
            const a = this.bodies[r];
            if (e.has(a.id) || a.type !== wt.Protoplanet && a.type !== wt.Planet) continue;
            const o = s.position[0] - a.position[0], l = s.position[1] - a.position[1], c = s.position[2] - a.position[2], h = Do(s.mass, this.cloudMass) + Do(a.mass, this.cloudMass);
            o * o + l * l + c * c <= h * h && (s.velocity = wu(s.mass, s.velocity, a.mass, a.velocity), s.mass += a.mass, s.radius = rr(s.mass, this.cloudMass), e.add(a.id));
          }
          t.push(s);
        }
      }
      e.size > 0 && (this.bodies = t.filter((n) => !e.has(n.id)));
    }
    spawnDebris(t) {
      const e = Math.max(0, nr - this.particles.length), n = Math.min(pu, e), s = Vn(t.velocity);
      for (let r = 0; r < n; r += 1) {
        const a = 0.75 + 0.5 * this.rng(), o = s * 0.08;
        this.particles.push({
          x: t.position[0] + (this.rng() - 0.5) * t.radius * 3,
          y: t.position[1] + (this.rng() - 0.5) * t.radius * 3,
          z: t.position[2] + (this.rng() - 0.5) * t.radius * 3,
          vx: t.velocity[0] * a + (this.rng() - 0.5) * o,
          vy: t.velocity[1] * a + (this.rng() - 0.5) * o,
          vz: t.velocity[2] * a + (this.rng() - 0.5) * o,
          r: 1,
          g: 0.55 + 0.35 * this.rng(),
          b: 0.25,
          size: 1.5,
          mass: 0,
          kind: 1,
          ttl: mu * (0.6 + 0.8 * this.rng())
        });
      }
    }
    cullParticles() {
      const t = this.cloudExtent * du, e = t * t;
      let n = false;
      const s = [];
      for (const r of this.particles) r.x * r.x + r.y * r.y + r.z * r.z <= e ? s.push(r) : n = true;
      n && (this.particles = s);
    }
    dissipateDiscMaterial() {
      this.particles = this.particles.filter((t) => t.kind === 2);
    }
    spawnEjecta() {
      const t = Math.max(0, nr - this.particles.length), e = Math.min(fu, t), n = this.cloudMass >= 8, s = (n ? 26 : 12) * Math.sqrt(this.mu / (this.cloudExtent + 1));
      for (let r = 0; r < e; r += 1) {
        const a = 2 * this.rng() - 1, o = Math.sqrt(Math.max(0, 1 - a * a)), l = 2 * Math.PI * this.rng(), c = [
          o * Math.cos(l),
          a,
          o * Math.sin(l)
        ], h = 1 + this.rng() * 2, d = Math.sqrt(2 * this.mu / Math.max(h, Number.EPSILON)), f = Math.max(s * (0.6 + 0.8 * this.rng()), _u * d);
        this.particles.push({
          x: c[0] * h,
          y: c[1] * h,
          z: c[2] * h,
          vx: c[0] * f,
          vy: c[1] * f,
          vz: c[2] * f,
          r: n ? 1 : 0.9,
          g: n ? 0.7 : 0.5,
          b: n ? 0.5 : 0.9,
          size: 1.6,
          mass: 0,
          kind: 2,
          ttl: 1 / 0
        });
      }
    }
    spawnVisitors(t) {
      this.spawnAccumulator += t;
      let e = 0;
      for (; this.spawnAccumulator >= Ao && e < Mo; ) this.spawnAccumulator -= Ao, this.visitorCount() < ru && this.bodies.push(this.makeVisitor()), e += 1;
    }
    promotePlanets() {
      for (const t of this.bodies) t.type === wt.Protoplanet && (t.type = wt.Planet);
    }
    visitorCount() {
      let t = 0;
      for (const e of this.bodies) (e.type === wt.Comet || e.type === wt.Asteroid) && (t += 1);
      return t;
    }
    makeVisitor() {
      const t = this.rng, e = this.mu, n = 2 * t() - 1, s = Math.sqrt(Math.max(0, 1 - n * n)), r = 2 * Math.PI * t(), a = [
        this.ejectRadius * s * Math.cos(r),
        this.ejectRadius * s * Math.sin(r),
        this.ejectRadius * n
      ], l = Math.sqrt(2 * e / Math.max(this.ejectRadius, Number.EPSILON)) * (0.9 + 0.7 * t()), c = Math.max(Vn(a), Number.EPSILON), h = this.ejectRadius * (0.08 + 0.45 * t()), d = Math.min(0.95, h / c), f = Math.sqrt(Math.max(0, 1 - d * d)), p = [
        a[0] / c,
        a[1] / c,
        a[2] / c
      ], g = Su(p, 2 * Math.PI * t()), v = [
        l * (-p[0] * f + g[0] * d),
        l * (-p[1] * f + g[1] * d),
        l * (-p[2] * f + g[2] * d)
      ], m = t() < 0.5;
      return {
        id: this.nextBodyId++,
        type: m ? wt.Comet : wt.Asteroid,
        mass: 1e-9,
        radius: m ? hu : uu,
        position: a,
        velocity: v,
        spin: t(),
        captured: false
      };
    }
    resolveVisitors() {
      const t = [];
      for (const e of this.bodies) {
        if (e.type !== wt.Comet && e.type !== wt.Asteroid) {
          t.push(e);
          continue;
        }
        const n = Cu(this.mu, e.position, e.velocity, this.ejectRadius);
        n === "captured" ? (e.captured || (e.captured = true, this.bus.emit({
          type: oe.BodyCaptured,
          simTime: this.simTime,
          data: {
            bodyId: e.id,
            bodyType: e.type
          }
        })), t.push(e)) : n === "ejected" ? this.bus.emit({
          type: oe.BodyEjected,
          simTime: this.simTime,
          data: {
            bodyId: e.id,
            bodyType: e.type
          }
        }) : t.push(e);
      }
      this.bodies = t;
    }
    rebuildParticleBuffer() {
      const t = this.particles.length * xi;
      this.particleBuffer.length !== t && (this.particleBuffer = new Float32Array(t)), this.writeParticleBuffer();
    }
    writeParticleBuffer() {
      const t = this.particleBuffer;
      for (let e = 0; e < this.particles.length; e += 1) {
        const n = this.particles[e];
        if (n === void 0) continue;
        const s = e * xi;
        t[s + Pe.x] = n.x, t[s + Pe.y] = n.y, t[s + Pe.z] = n.z, t[s + Pe.r] = n.r, t[s + Pe.g] = n.g, t[s + Pe.b] = n.b, t[s + Pe.size] = n.size;
      }
    }
    rebuildBodyBuffer() {
      const t = this.bodies.length * Ke;
      this.bodyBuffer.length !== t && (this.bodyBuffer = new Float32Array(t)), this.writeBodyBuffer();
    }
    writeBodyBuffer() {
      const t = this.bodyBuffer;
      for (let e = 0; e < this.bodies.length; e += 1) {
        const n = this.bodies[e];
        if (n === void 0) continue;
        const s = e * Ke;
        t[s + Tt.id] = n.id, t[s + Tt.type] = n.type, t[s + Tt.mass] = n.mass, t[s + Tt.radius] = n.radius, t[s + Tt.x] = n.position[0], t[s + Tt.y] = n.position[1], t[s + Tt.z] = n.position[2], t[s + Tt.vx] = n.velocity[0], t[s + Tt.vy] = n.velocity[1], t[s + Tt.vz] = n.velocity[2], t[s + Tt.spin] = n.spin, t[s + Tt.captured] = n.captured ? 1 : 0;
      }
    }
    speciesCumulative(t) {
      const e = t.hydrogen, n = e + t.helium, s = n + t.metals;
      return [
        e,
        n,
        s
      ];
    }
    speciesColorSize(t) {
      const e = this.rng() * (t[2] > 0 ? t[2] : 1);
      let n, s;
      return e < t[0] ? (n = sr.hydrogen, s = 1) : e < t[1] ? (n = sr.helium, s = 1.1) : (n = sr.metals, s = 1.4), [
        n[0],
        n[1],
        n[2],
        s
      ];
    }
  }
  class Ru {
    constructor(t) {
      this.mod = t;
    }
    handle = null;
    init(t) {
      const { config: e, particleCount: n } = t;
      this.handle?.free(), this.handle = new this.mod.Kernel(e.mass, e.cloudExtent, e.pace, e.composition.hydrogen, e.composition.helium, e.composition.metals, Math.max(0, Math.floor(n)));
    }
    step(t) {
      const e = this.requireHandle(), n = e.step(t);
      return {
        events: this.drainEvents(e, n),
        stage: e.stage(),
        stageProgress: e.stage_progress(),
        elapsedSimSeconds: e.elapsed_sim_seconds()
      };
    }
    getParticleBuffer() {
      const t = this.requireHandle();
      return new Float32Array(this.buffer(), t.particle_ptr(), t.particle_len());
    }
    getBodyBuffer() {
      const t = this.requireHandle();
      return new Float32Array(this.buffer(), t.body_ptr(), t.body_len());
    }
    dispose() {
      this.handle?.free(), this.handle = null;
    }
    requireHandle() {
      if (this.handle === null) throw new Error("WasmKernel used before init");
      return this.handle;
    }
    buffer() {
      return this.mod.wasm_memory().buffer;
    }
    drainEvents(t, e) {
      if (e <= 0) return [];
      const n = t.event_stride(), s = new Float64Array(this.buffer(), t.events_ptr(), e * n), r = [];
      for (let a = 0; a < e; a += 1) {
        const o = a * n, l = s[o], c = s[o + 1] ?? 0, h = s[o + 2] ?? 0, d = s[o + 3] ?? 0, f = Pu(l, h, d);
        r.push(f === void 0 ? _o(l, c) : _o(l, c, f));
      }
      return r;
    }
  }
  function Pu(i, t, e) {
    switch (i) {
      case oe.DeathEvent:
        return {
          supernova: t === 1
        };
      case oe.RemnantFormed:
        return {
          remnant: t,
          supernova: e === 1
        };
      case oe.BodyCaptured:
      case oe.BodyEjected:
      case oe.BodyConsumed:
        return {
          bodyId: t,
          bodyType: e
        };
      default:
        return;
    }
  }
  function Du(i) {
    const t = typeof document < "u" ? document.baseURI : void 0;
    return t !== void 0 ? new URL("wasm/pkg/star_kernel.js", t).href : new URL("" + new URL("star_kernel-CHEu6ziq.js", import.meta.url).href, import.meta.url).href;
  }
  async function Iu(i) {
    const e = await import(Du()).then(async (m) => {
      await m.__tla;
      return m;
    });
    return await e.default(i), e;
  }
  async function Lu() {
    if (!Uu()) return new Io();
    try {
      const i = await Iu();
      return new Ru(i);
    } catch {
      return new Io();
    }
  }
  function Uu() {
    return typeof WebAssembly == "object" && typeof WebAssembly.instantiate == "function" && typeof WebAssembly.Memory == "function";
  }
  const Oa = "170", Mi = {
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2
  }, gi = {
    ROTATE: 0,
    PAN: 1,
    DOLLY_PAN: 2,
    DOLLY_ROTATE: 3
  }, Nu = 0, Lo = 1, Fu = 2, Mc = 1, Ou = 2, un = 3, Pn = 0, Ie = 1, qe = 2, fn = 0, Si = 1, Wn = 2, Uo = 3, No = 4, Bu = 5, zn = 100, zu = 101, ku = 102, Hu = 103, Gu = 104, Vu = 200, Wu = 201, Xu = 202, qu = 203, Wr = 204, Xr = 205, Yu = 206, ju = 207, Ku = 208, Zu = 209, $u = 210, Ju = 211, Qu = 212, td = 213, ed = 214, qr = 0, Yr = 1, jr = 2, Ti = 3, Kr = 4, Zr = 5, $r = 6, Jr = 7, Sc = 0, nd = 1, id = 2, Rn = 0, yc = 1, Ec = 2, bc = 3, Ba = 4, sd = 5, Tc = 6, Ac = 7, wc = 300, Ai = 301, wi = 302, Qr = 303, ta = 304, Js = 306, ea = 1e3, Hn = 1001, na = 1002, Oe = 1003, rd = 1004, us = 1005, Qe = 1006, ar = 1007, Gn = 1008, gn = 1009, Cc = 1010, Rc = 1011, ts = 1012, za = 1013, Xn = 1014, tn = 1015, pn = 1016, ka = 1017, Ha = 1018, Ci = 1020, Pc = 35902, Dc = 1021, Ic = 1022, je = 1023, Lc = 1024, Uc = 1025, yi = 1026, Ri = 1027, Ga = 1028, Va = 1029, Nc = 1030, Wa = 1031, Xa = 1033, ks = 33776, Hs = 33777, Gs = 33778, Vs = 33779, ia = 35840, sa = 35841, ra = 35842, aa = 35843, oa = 36196, la = 37492, ca = 37496, ha = 37808, ua = 37809, da = 37810, fa = 37811, pa = 37812, ma = 37813, ga = 37814, _a = 37815, va = 37816, xa = 37817, Ma = 37818, Sa = 37819, ya = 37820, Ea = 37821, Ws = 36492, ba = 36494, Ta = 36495, Fc = 36283, Aa = 36284, wa = 36285, Ca = 36286, ad = 3200, od = 3201, Oc = 0, ld = 1, An = "", Fe = "srgb", Ii = "srgb-linear", Qs = "linear", Kt = "srgb", Qn = 7680, Fo = 519, cd = 512, hd = 513, ud = 514, Bc = 515, dd = 516, fd = 517, pd = 518, md = 519, Oo = 35044, pi = 35048, Bo = "300 es", dn = 2e3, qs = 2001;
  class jn {
    addEventListener(t, e) {
      this._listeners === void 0 && (this._listeners = {});
      const n = this._listeners;
      n[t] === void 0 && (n[t] = []), n[t].indexOf(e) === -1 && n[t].push(e);
    }
    hasEventListener(t, e) {
      if (this._listeners === void 0) return false;
      const n = this._listeners;
      return n[t] !== void 0 && n[t].indexOf(e) !== -1;
    }
    removeEventListener(t, e) {
      if (this._listeners === void 0) return;
      const s = this._listeners[t];
      if (s !== void 0) {
        const r = s.indexOf(e);
        r !== -1 && s.splice(r, 1);
      }
    }
    dispatchEvent(t) {
      if (this._listeners === void 0) return;
      const n = this._listeners[t.type];
      if (n !== void 0) {
        t.target = this;
        const s = n.slice(0);
        for (let r = 0, a = s.length; r < a; r++) s[r].call(this, t);
        t.target = null;
      }
    }
  }
  const Se = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "0a",
    "0b",
    "0c",
    "0d",
    "0e",
    "0f",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "1a",
    "1b",
    "1c",
    "1d",
    "1e",
    "1f",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "2a",
    "2b",
    "2c",
    "2d",
    "2e",
    "2f",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "3a",
    "3b",
    "3c",
    "3d",
    "3e",
    "3f",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "4a",
    "4b",
    "4c",
    "4d",
    "4e",
    "4f",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
    "5a",
    "5b",
    "5c",
    "5d",
    "5e",
    "5f",
    "60",
    "61",
    "62",
    "63",
    "64",
    "65",
    "66",
    "67",
    "68",
    "69",
    "6a",
    "6b",
    "6c",
    "6d",
    "6e",
    "6f",
    "70",
    "71",
    "72",
    "73",
    "74",
    "75",
    "76",
    "77",
    "78",
    "79",
    "7a",
    "7b",
    "7c",
    "7d",
    "7e",
    "7f",
    "80",
    "81",
    "82",
    "83",
    "84",
    "85",
    "86",
    "87",
    "88",
    "89",
    "8a",
    "8b",
    "8c",
    "8d",
    "8e",
    "8f",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
    "96",
    "97",
    "98",
    "99",
    "9a",
    "9b",
    "9c",
    "9d",
    "9e",
    "9f",
    "a0",
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
    "a9",
    "aa",
    "ab",
    "ac",
    "ad",
    "ae",
    "af",
    "b0",
    "b1",
    "b2",
    "b3",
    "b4",
    "b5",
    "b6",
    "b7",
    "b8",
    "b9",
    "ba",
    "bb",
    "bc",
    "bd",
    "be",
    "bf",
    "c0",
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "ca",
    "cb",
    "cc",
    "cd",
    "ce",
    "cf",
    "d0",
    "d1",
    "d2",
    "d3",
    "d4",
    "d5",
    "d6",
    "d7",
    "d8",
    "d9",
    "da",
    "db",
    "dc",
    "dd",
    "de",
    "df",
    "e0",
    "e1",
    "e2",
    "e3",
    "e4",
    "e5",
    "e6",
    "e7",
    "e8",
    "e9",
    "ea",
    "eb",
    "ec",
    "ed",
    "ee",
    "ef",
    "f0",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "fa",
    "fb",
    "fc",
    "fd",
    "fe",
    "ff"
  ];
  let zo = 1234567;
  const Ji = Math.PI / 180, es = 180 / Math.PI;
  function Li() {
    const i = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
    return (Se[i & 255] + Se[i >> 8 & 255] + Se[i >> 16 & 255] + Se[i >> 24 & 255] + "-" + Se[t & 255] + Se[t >> 8 & 255] + "-" + Se[t >> 16 & 15 | 64] + Se[t >> 24 & 255] + "-" + Se[e & 63 | 128] + Se[e >> 8 & 255] + "-" + Se[e >> 16 & 255] + Se[e >> 24 & 255] + Se[n & 255] + Se[n >> 8 & 255] + Se[n >> 16 & 255] + Se[n >> 24 & 255]).toLowerCase();
  }
  function Ee(i, t, e) {
    return Math.max(t, Math.min(e, i));
  }
  function qa(i, t) {
    return (i % t + t) % t;
  }
  function gd(i, t, e, n, s) {
    return n + (i - t) * (s - n) / (e - t);
  }
  function _d(i, t, e) {
    return i !== t ? (e - i) / (t - i) : 0;
  }
  function Qi(i, t, e) {
    return (1 - e) * i + e * t;
  }
  function vd(i, t, e, n) {
    return Qi(i, t, 1 - Math.exp(-e * n));
  }
  function xd(i, t = 1) {
    return t - Math.abs(qa(i, t * 2) - t);
  }
  function Md(i, t, e) {
    return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * (3 - 2 * i));
  }
  function Sd(i, t, e) {
    return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * i * (i * (i * 6 - 15) + 10));
  }
  function yd(i, t) {
    return i + Math.floor(Math.random() * (t - i + 1));
  }
  function Ed(i, t) {
    return i + Math.random() * (t - i);
  }
  function bd(i) {
    return i * (0.5 - Math.random());
  }
  function Td(i) {
    i !== void 0 && (zo = i);
    let t = zo += 1831565813;
    return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function Ad(i) {
    return i * Ji;
  }
  function wd(i) {
    return i * es;
  }
  function Cd(i) {
    return (i & i - 1) === 0 && i !== 0;
  }
  function Rd(i) {
    return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
  }
  function Pd(i) {
    return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
  }
  function Dd(i, t, e, n, s) {
    const r = Math.cos, a = Math.sin, o = r(e / 2), l = a(e / 2), c = r((t + n) / 2), h = a((t + n) / 2), d = r((t - n) / 2), f = a((t - n) / 2), p = r((n - t) / 2), g = a((n - t) / 2);
    switch (s) {
      case "XYX":
        i.set(o * h, l * d, l * f, o * c);
        break;
      case "YZY":
        i.set(l * f, o * h, l * d, o * c);
        break;
      case "ZXZ":
        i.set(l * d, l * f, o * h, o * c);
        break;
      case "XZX":
        i.set(o * h, l * g, l * p, o * c);
        break;
      case "YXY":
        i.set(l * p, o * h, l * g, o * c);
        break;
      case "ZYZ":
        i.set(l * g, l * p, o * h, o * c);
        break;
      default:
        console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + s);
    }
  }
  function mi(i, t) {
    switch (t.constructor) {
      case Float32Array:
        return i;
      case Uint32Array:
        return i / 4294967295;
      case Uint16Array:
        return i / 65535;
      case Uint8Array:
        return i / 255;
      case Int32Array:
        return Math.max(i / 2147483647, -1);
      case Int16Array:
        return Math.max(i / 32767, -1);
      case Int8Array:
        return Math.max(i / 127, -1);
      default:
        throw new Error("Invalid component type.");
    }
  }
  function Te(i, t) {
    switch (t.constructor) {
      case Float32Array:
        return i;
      case Uint32Array:
        return Math.round(i * 4294967295);
      case Uint16Array:
        return Math.round(i * 65535);
      case Uint8Array:
        return Math.round(i * 255);
      case Int32Array:
        return Math.round(i * 2147483647);
      case Int16Array:
        return Math.round(i * 32767);
      case Int8Array:
        return Math.round(i * 127);
      default:
        throw new Error("Invalid component type.");
    }
  }
  const zc = {
    DEG2RAD: Ji,
    RAD2DEG: es,
    generateUUID: Li,
    clamp: Ee,
    euclideanModulo: qa,
    mapLinear: gd,
    inverseLerp: _d,
    lerp: Qi,
    damp: vd,
    pingpong: xd,
    smoothstep: Md,
    smootherstep: Sd,
    randInt: yd,
    randFloat: Ed,
    randFloatSpread: bd,
    seededRandom: Td,
    degToRad: Ad,
    radToDeg: wd,
    isPowerOfTwo: Cd,
    ceilPowerOfTwo: Rd,
    floorPowerOfTwo: Pd,
    setQuaternionFromProperEuler: Dd,
    normalize: Te,
    denormalize: mi
  };
  class _t {
    constructor(t = 0, e = 0) {
      _t.prototype.isVector2 = true, this.x = t, this.y = e;
    }
    get width() {
      return this.x;
    }
    set width(t) {
      this.x = t;
    }
    get height() {
      return this.y;
    }
    set height(t) {
      this.y = t;
    }
    set(t, e) {
      return this.x = t, this.y = e, this;
    }
    setScalar(t) {
      return this.x = t, this.y = t, this;
    }
    setX(t) {
      return this.x = t, this;
    }
    setY(t) {
      return this.y = t, this;
    }
    setComponent(t, e) {
      switch (t) {
        case 0:
          this.x = e;
          break;
        case 1:
          this.y = e;
          break;
        default:
          throw new Error("index is out of range: " + t);
      }
      return this;
    }
    getComponent(t) {
      switch (t) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + t);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y);
    }
    copy(t) {
      return this.x = t.x, this.y = t.y, this;
    }
    add(t) {
      return this.x += t.x, this.y += t.y, this;
    }
    addScalar(t) {
      return this.x += t, this.y += t, this;
    }
    addVectors(t, e) {
      return this.x = t.x + e.x, this.y = t.y + e.y, this;
    }
    addScaledVector(t, e) {
      return this.x += t.x * e, this.y += t.y * e, this;
    }
    sub(t) {
      return this.x -= t.x, this.y -= t.y, this;
    }
    subScalar(t) {
      return this.x -= t, this.y -= t, this;
    }
    subVectors(t, e) {
      return this.x = t.x - e.x, this.y = t.y - e.y, this;
    }
    multiply(t) {
      return this.x *= t.x, this.y *= t.y, this;
    }
    multiplyScalar(t) {
      return this.x *= t, this.y *= t, this;
    }
    divide(t) {
      return this.x /= t.x, this.y /= t.y, this;
    }
    divideScalar(t) {
      return this.multiplyScalar(1 / t);
    }
    applyMatrix3(t) {
      const e = this.x, n = this.y, s = t.elements;
      return this.x = s[0] * e + s[3] * n + s[6], this.y = s[1] * e + s[4] * n + s[7], this;
    }
    min(t) {
      return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
    }
    max(t) {
      return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
    }
    clamp(t, e) {
      return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), this;
    }
    clampScalar(t, e) {
      return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), this;
    }
    clampLength(t, e) {
      const n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(Math.max(t, Math.min(e, n)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    }
    roundToZero() {
      return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this;
    }
    dot(t) {
      return this.x * t.x + this.y * t.y;
    }
    cross(t) {
      return this.x * t.y - this.y * t.x;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    angle() {
      return Math.atan2(-this.y, -this.x) + Math.PI;
    }
    angleTo(t) {
      const e = Math.sqrt(this.lengthSq() * t.lengthSq());
      if (e === 0) return Math.PI / 2;
      const n = this.dot(t) / e;
      return Math.acos(Ee(n, -1, 1));
    }
    distanceTo(t) {
      return Math.sqrt(this.distanceToSquared(t));
    }
    distanceToSquared(t) {
      const e = this.x - t.x, n = this.y - t.y;
      return e * e + n * n;
    }
    manhattanDistanceTo(t) {
      return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
    }
    setLength(t) {
      return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
      return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this;
    }
    lerpVectors(t, e, n) {
      return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this;
    }
    equals(t) {
      return t.x === this.x && t.y === this.y;
    }
    fromArray(t, e = 0) {
      return this.x = t[e], this.y = t[e + 1], this;
    }
    toArray(t = [], e = 0) {
      return t[e] = this.x, t[e + 1] = this.y, t;
    }
    fromBufferAttribute(t, e) {
      return this.x = t.getX(e), this.y = t.getY(e), this;
    }
    rotateAround(t, e) {
      const n = Math.cos(e), s = Math.sin(e), r = this.x - t.x, a = this.y - t.y;
      return this.x = r * n - a * s + t.x, this.y = r * s + a * n + t.y, this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y;
    }
  }
  class Ut {
    constructor(t, e, n, s, r, a, o, l, c) {
      Ut.prototype.isMatrix3 = true, this.elements = [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ], t !== void 0 && this.set(t, e, n, s, r, a, o, l, c);
    }
    set(t, e, n, s, r, a, o, l, c) {
      const h = this.elements;
      return h[0] = t, h[1] = s, h[2] = o, h[3] = e, h[4] = r, h[5] = l, h[6] = n, h[7] = a, h[8] = c, this;
    }
    identity() {
      return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
    }
    copy(t) {
      const e = this.elements, n = t.elements;
      return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], this;
    }
    extractBasis(t, e, n) {
      return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
    }
    setFromMatrix4(t) {
      const e = t.elements;
      return this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]), this;
    }
    multiply(t) {
      return this.multiplyMatrices(this, t);
    }
    premultiply(t) {
      return this.multiplyMatrices(t, this);
    }
    multiplyMatrices(t, e) {
      const n = t.elements, s = e.elements, r = this.elements, a = n[0], o = n[3], l = n[6], c = n[1], h = n[4], d = n[7], f = n[2], p = n[5], g = n[8], v = s[0], m = s[3], u = s[6], b = s[1], E = s[4], S = s[7], N = s[2], A = s[5], w = s[8];
      return r[0] = a * v + o * b + l * N, r[3] = a * m + o * E + l * A, r[6] = a * u + o * S + l * w, r[1] = c * v + h * b + d * N, r[4] = c * m + h * E + d * A, r[7] = c * u + h * S + d * w, r[2] = f * v + p * b + g * N, r[5] = f * m + p * E + g * A, r[8] = f * u + p * S + g * w, this;
    }
    multiplyScalar(t) {
      const e = this.elements;
      return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, e[5] *= t, e[8] *= t, this;
    }
    determinant() {
      const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8];
      return e * a * h - e * o * c - n * r * h + n * o * l + s * r * c - s * a * l;
    }
    invert() {
      const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], d = h * a - o * c, f = o * l - h * r, p = c * r - a * l, g = e * d + n * f + s * p;
      if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      const v = 1 / g;
      return t[0] = d * v, t[1] = (s * c - h * n) * v, t[2] = (o * n - s * a) * v, t[3] = f * v, t[4] = (h * e - s * l) * v, t[5] = (s * r - o * e) * v, t[6] = p * v, t[7] = (n * l - c * e) * v, t[8] = (a * e - n * r) * v, this;
    }
    transpose() {
      let t;
      const e = this.elements;
      return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], e[5] = e[7], e[7] = t, this;
    }
    getNormalMatrix(t) {
      return this.setFromMatrix4(t).invert().transpose();
    }
    transposeIntoArray(t) {
      const e = this.elements;
      return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], t[6] = e[2], t[7] = e[5], t[8] = e[8], this;
    }
    setUvTransform(t, e, n, s, r, a, o) {
      const l = Math.cos(r), c = Math.sin(r);
      return this.set(n * l, n * c, -n * (l * a + c * o) + a + t, -s * c, s * l, -s * (-c * a + l * o) + o + e, 0, 0, 1), this;
    }
    scale(t, e) {
      return this.premultiply(or.makeScale(t, e)), this;
    }
    rotate(t) {
      return this.premultiply(or.makeRotation(-t)), this;
    }
    translate(t, e) {
      return this.premultiply(or.makeTranslation(t, e)), this;
    }
    makeTranslation(t, e) {
      return t.isVector2 ? this.set(1, 0, t.x, 0, 1, t.y, 0, 0, 1) : this.set(1, 0, t, 0, 1, e, 0, 0, 1), this;
    }
    makeRotation(t) {
      const e = Math.cos(t), n = Math.sin(t);
      return this.set(e, -n, 0, n, e, 0, 0, 0, 1), this;
    }
    makeScale(t, e) {
      return this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this;
    }
    equals(t) {
      const e = this.elements, n = t.elements;
      for (let s = 0; s < 9; s++) if (e[s] !== n[s]) return false;
      return true;
    }
    fromArray(t, e = 0) {
      for (let n = 0; n < 9; n++) this.elements[n] = t[n + e];
      return this;
    }
    toArray(t = [], e = 0) {
      const n = this.elements;
      return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t;
    }
    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  }
  const or = new Ut();
  function kc(i) {
    for (let t = i.length - 1; t >= 0; --t) if (i[t] >= 65535) return true;
    return false;
  }
  function Ys(i) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", i);
  }
  function Id() {
    const i = Ys("canvas");
    return i.style.display = "block", i;
  }
  const ko = {};
  function Zi(i) {
    i in ko || (ko[i] = true, console.warn(i));
  }
  function Ld(i, t, e) {
    return new Promise(function(n, s) {
      function r() {
        switch (i.clientWaitSync(t, i.SYNC_FLUSH_COMMANDS_BIT, 0)) {
          case i.WAIT_FAILED:
            s();
            break;
          case i.TIMEOUT_EXPIRED:
            setTimeout(r, e);
            break;
          default:
            n();
        }
      }
      setTimeout(r, e);
    });
  }
  function Ud(i) {
    const t = i.elements;
    t[2] = 0.5 * t[2] + 0.5 * t[3], t[6] = 0.5 * t[6] + 0.5 * t[7], t[10] = 0.5 * t[10] + 0.5 * t[11], t[14] = 0.5 * t[14] + 0.5 * t[15];
  }
  function Nd(i) {
    const t = i.elements;
    t[11] === -1 ? (t[10] = -t[10] - 1, t[14] = -t[14]) : (t[10] = -t[10], t[14] = -t[14] + 1);
  }
  const Gt = {
    enabled: true,
    workingColorSpace: Ii,
    spaces: {},
    convert: function(i, t, e) {
      return this.enabled === false || t === e || !t || !e || (this.spaces[t].transfer === Kt && (i.r = mn(i.r), i.g = mn(i.g), i.b = mn(i.b)), this.spaces[t].primaries !== this.spaces[e].primaries && (i.applyMatrix3(this.spaces[t].toXYZ), i.applyMatrix3(this.spaces[e].fromXYZ)), this.spaces[e].transfer === Kt && (i.r = Ei(i.r), i.g = Ei(i.g), i.b = Ei(i.b))), i;
    },
    fromWorkingColorSpace: function(i, t) {
      return this.convert(i, this.workingColorSpace, t);
    },
    toWorkingColorSpace: function(i, t) {
      return this.convert(i, t, this.workingColorSpace);
    },
    getPrimaries: function(i) {
      return this.spaces[i].primaries;
    },
    getTransfer: function(i) {
      return i === An ? Qs : this.spaces[i].transfer;
    },
    getLuminanceCoefficients: function(i, t = this.workingColorSpace) {
      return i.fromArray(this.spaces[t].luminanceCoefficients);
    },
    define: function(i) {
      Object.assign(this.spaces, i);
    },
    _getMatrix: function(i, t, e) {
      return i.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(i) {
      return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(i = this.workingColorSpace) {
      return this.spaces[i].workingColorSpaceConfig.unpackColorSpace;
    }
  };
  function mn(i) {
    return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
  }
  function Ei(i) {
    return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
  }
  const Ho = [
    0.64,
    0.33,
    0.3,
    0.6,
    0.15,
    0.06
  ], Go = [
    0.2126,
    0.7152,
    0.0722
  ], Vo = [
    0.3127,
    0.329
  ], Wo = new Ut().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322), Xo = new Ut().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
  Gt.define({
    [Ii]: {
      primaries: Ho,
      whitePoint: Vo,
      transfer: Qs,
      toXYZ: Wo,
      fromXYZ: Xo,
      luminanceCoefficients: Go,
      workingColorSpaceConfig: {
        unpackColorSpace: Fe
      },
      outputColorSpaceConfig: {
        drawingBufferColorSpace: Fe
      }
    },
    [Fe]: {
      primaries: Ho,
      whitePoint: Vo,
      transfer: Kt,
      toXYZ: Wo,
      fromXYZ: Xo,
      luminanceCoefficients: Go,
      outputColorSpaceConfig: {
        drawingBufferColorSpace: Fe
      }
    }
  });
  let ti;
  class Fd {
    static getDataURL(t) {
      if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
      let e;
      if (t instanceof HTMLCanvasElement) e = t;
      else {
        ti === void 0 && (ti = Ys("canvas")), ti.width = t.width, ti.height = t.height;
        const n = ti.getContext("2d");
        t instanceof ImageData ? n.putImageData(t, 0, 0) : n.drawImage(t, 0, 0, t.width, t.height), e = ti;
      }
      return e.width > 2048 || e.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", t), e.toDataURL("image/jpeg", 0.6)) : e.toDataURL("image/png");
    }
    static sRGBToLinear(t) {
      if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
        const e = Ys("canvas");
        e.width = t.width, e.height = t.height;
        const n = e.getContext("2d");
        n.drawImage(t, 0, 0, t.width, t.height);
        const s = n.getImageData(0, 0, t.width, t.height), r = s.data;
        for (let a = 0; a < r.length; a++) r[a] = mn(r[a] / 255) * 255;
        return n.putImageData(s, 0, 0), e;
      } else if (t.data) {
        const e = t.data.slice(0);
        for (let n = 0; n < e.length; n++) e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(mn(e[n] / 255) * 255) : e[n] = mn(e[n]);
        return {
          data: e,
          width: t.width,
          height: t.height
        };
      } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
    }
  }
  let Od = 0;
  class Hc {
    constructor(t = null) {
      this.isSource = true, Object.defineProperty(this, "id", {
        value: Od++
      }), this.uuid = Li(), this.data = t, this.dataReady = true, this.version = 0;
    }
    set needsUpdate(t) {
      t === true && this.version++;
    }
    toJSON(t) {
      const e = t === void 0 || typeof t == "string";
      if (!e && t.images[this.uuid] !== void 0) return t.images[this.uuid];
      const n = {
        uuid: this.uuid,
        url: ""
      }, s = this.data;
      if (s !== null) {
        let r;
        if (Array.isArray(s)) {
          r = [];
          for (let a = 0, o = s.length; a < o; a++) s[a].isDataTexture ? r.push(lr(s[a].image)) : r.push(lr(s[a]));
        } else r = lr(s);
        n.url = r;
      }
      return e || (t.images[this.uuid] = n), n;
    }
  }
  function lr(i) {
    return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? Fd.getDataURL(i) : i.data ? {
      data: Array.from(i.data),
      width: i.width,
      height: i.height,
      type: i.data.constructor.name
    } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
  }
  let Bd = 0;
  class we extends jn {
    constructor(t = we.DEFAULT_IMAGE, e = we.DEFAULT_MAPPING, n = Hn, s = Hn, r = Qe, a = Gn, o = je, l = gn, c = we.DEFAULT_ANISOTROPY, h = An) {
      super(), this.isTexture = true, Object.defineProperty(this, "id", {
        value: Bd++
      }), this.uuid = Li(), this.name = "", this.source = new Hc(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = s, this.magFilter = r, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new _t(0, 0), this.repeat = new _t(1, 1), this.center = new _t(0, 0), this.rotation = 0, this.matrixAutoUpdate = true, this.matrix = new Ut(), this.generateMipmaps = true, this.premultiplyAlpha = false, this.flipY = true, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = false, this.pmremVersion = 0;
    }
    get image() {
      return this.source.data;
    }
    set image(t = null) {
      this.source.data = t;
    }
    updateMatrix() {
      this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = true, this;
    }
    toJSON(t) {
      const e = t === void 0 || typeof t == "string";
      if (!e && t.textures[this.uuid] !== void 0) return t.textures[this.uuid];
      const n = {
        metadata: {
          version: 4.6,
          type: "Texture",
          generator: "Texture.toJSON"
        },
        uuid: this.uuid,
        name: this.name,
        image: this.source.toJSON(t).uuid,
        mapping: this.mapping,
        channel: this.channel,
        repeat: [
          this.repeat.x,
          this.repeat.y
        ],
        offset: [
          this.offset.x,
          this.offset.y
        ],
        center: [
          this.center.x,
          this.center.y
        ],
        rotation: this.rotation,
        wrap: [
          this.wrapS,
          this.wrapT
        ],
        format: this.format,
        internalFormat: this.internalFormat,
        type: this.type,
        colorSpace: this.colorSpace,
        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,
        flipY: this.flipY,
        generateMipmaps: this.generateMipmaps,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment
      };
      return Object.keys(this.userData).length > 0 && (n.userData = this.userData), e || (t.textures[this.uuid] = n), n;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
    transformUv(t) {
      if (this.mapping !== wc) return t;
      if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
        case ea:
          t.x = t.x - Math.floor(t.x);
          break;
        case Hn:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case na:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
      if (t.y < 0 || t.y > 1) switch (this.wrapT) {
        case ea:
          t.y = t.y - Math.floor(t.y);
          break;
        case Hn:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case na:
          Math.abs(Math.floor(t.y) % 2) === 1 ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
          break;
      }
      return this.flipY && (t.y = 1 - t.y), t;
    }
    set needsUpdate(t) {
      t === true && (this.version++, this.source.needsUpdate = true);
    }
    set needsPMREMUpdate(t) {
      t === true && this.pmremVersion++;
    }
  }
  we.DEFAULT_IMAGE = null;
  we.DEFAULT_MAPPING = wc;
  we.DEFAULT_ANISOTROPY = 1;
  class Jt {
    constructor(t = 0, e = 0, n = 0, s = 1) {
      Jt.prototype.isVector4 = true, this.x = t, this.y = e, this.z = n, this.w = s;
    }
    get width() {
      return this.z;
    }
    set width(t) {
      this.z = t;
    }
    get height() {
      return this.w;
    }
    set height(t) {
      this.w = t;
    }
    set(t, e, n, s) {
      return this.x = t, this.y = e, this.z = n, this.w = s, this;
    }
    setScalar(t) {
      return this.x = t, this.y = t, this.z = t, this.w = t, this;
    }
    setX(t) {
      return this.x = t, this;
    }
    setY(t) {
      return this.y = t, this;
    }
    setZ(t) {
      return this.z = t, this;
    }
    setW(t) {
      return this.w = t, this;
    }
    setComponent(t, e) {
      switch (t) {
        case 0:
          this.x = e;
          break;
        case 1:
          this.y = e;
          break;
        case 2:
          this.z = e;
          break;
        case 3:
          this.w = e;
          break;
        default:
          throw new Error("index is out of range: " + t);
      }
      return this;
    }
    getComponent(t) {
      switch (t) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + t);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(t) {
      return this.x = t.x, this.y = t.y, this.z = t.z, this.w = t.w !== void 0 ? t.w : 1, this;
    }
    add(t) {
      return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
    }
    addScalar(t) {
      return this.x += t, this.y += t, this.z += t, this.w += t, this;
    }
    addVectors(t, e) {
      return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, this;
    }
    addScaledVector(t, e) {
      return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this.w += t.w * e, this;
    }
    sub(t) {
      return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
    }
    subScalar(t) {
      return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
    }
    subVectors(t, e) {
      return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, this;
    }
    multiply(t) {
      return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
    }
    multiplyScalar(t) {
      return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
    }
    applyMatrix4(t) {
      const e = this.x, n = this.y, s = this.z, r = this.w, a = t.elements;
      return this.x = a[0] * e + a[4] * n + a[8] * s + a[12] * r, this.y = a[1] * e + a[5] * n + a[9] * s + a[13] * r, this.z = a[2] * e + a[6] * n + a[10] * s + a[14] * r, this.w = a[3] * e + a[7] * n + a[11] * s + a[15] * r, this;
    }
    divide(t) {
      return this.x /= t.x, this.y /= t.y, this.z /= t.z, this.w /= t.w, this;
    }
    divideScalar(t) {
      return this.multiplyScalar(1 / t);
    }
    setAxisAngleFromQuaternion(t) {
      this.w = 2 * Math.acos(t.w);
      const e = Math.sqrt(1 - t.w * t.w);
      return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, this.z = t.z / e), this;
    }
    setAxisAngleFromRotationMatrix(t) {
      let e, n, s, r;
      const l = t.elements, c = l[0], h = l[4], d = l[8], f = l[1], p = l[5], g = l[9], v = l[2], m = l[6], u = l[10];
      if (Math.abs(h - f) < 0.01 && Math.abs(d - v) < 0.01 && Math.abs(g - m) < 0.01) {
        if (Math.abs(h + f) < 0.1 && Math.abs(d + v) < 0.1 && Math.abs(g + m) < 0.1 && Math.abs(c + p + u - 3) < 0.1) return this.set(1, 0, 0, 0), this;
        e = Math.PI;
        const E = (c + 1) / 2, S = (p + 1) / 2, N = (u + 1) / 2, A = (h + f) / 4, w = (d + v) / 4, P = (g + m) / 4;
        return E > S && E > N ? E < 0.01 ? (n = 0, s = 0.707106781, r = 0.707106781) : (n = Math.sqrt(E), s = A / n, r = w / n) : S > N ? S < 0.01 ? (n = 0.707106781, s = 0, r = 0.707106781) : (s = Math.sqrt(S), n = A / s, r = P / s) : N < 0.01 ? (n = 0.707106781, s = 0.707106781, r = 0) : (r = Math.sqrt(N), n = w / r, s = P / r), this.set(n, s, r, e), this;
      }
      let b = Math.sqrt((m - g) * (m - g) + (d - v) * (d - v) + (f - h) * (f - h));
      return Math.abs(b) < 1e-3 && (b = 1), this.x = (m - g) / b, this.y = (d - v) / b, this.z = (f - h) / b, this.w = Math.acos((c + p + u - 1) / 2), this;
    }
    setFromMatrixPosition(t) {
      const e = t.elements;
      return this.x = e[12], this.y = e[13], this.z = e[14], this.w = e[15], this;
    }
    min(t) {
      return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this.w = Math.min(this.w, t.w), this;
    }
    max(t) {
      return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this.w = Math.max(this.w, t.w), this;
    }
    clamp(t, e) {
      return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), this.z = Math.max(t.z, Math.min(e.z, this.z)), this.w = Math.max(t.w, Math.min(e.w, this.w)), this;
    }
    clampScalar(t, e) {
      return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), this.z = Math.max(t, Math.min(e, this.z)), this.w = Math.max(t, Math.min(e, this.w)), this;
    }
    clampLength(t, e) {
      const n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(Math.max(t, Math.min(e, n)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
    }
    roundToZero() {
      return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
    }
    dot(t) {
      return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(t) {
      return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
      return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this.w += (t.w - this.w) * e, this;
    }
    lerpVectors(t, e, n) {
      return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this.w = t.w + (e.w - t.w) * n, this;
    }
    equals(t) {
      return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
    }
    fromArray(t, e = 0) {
      return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this;
    }
    toArray(t = [], e = 0) {
      return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t;
    }
    fromBufferAttribute(t, e) {
      return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this.w = t.getW(e), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z, yield this.w;
    }
  }
  class zd extends jn {
    constructor(t = 1, e = 1, n = {}) {
      super(), this.isRenderTarget = true, this.width = t, this.height = e, this.depth = 1, this.scissor = new Jt(0, 0, t, e), this.scissorTest = false, this.viewport = new Jt(0, 0, t, e);
      const s = {
        width: t,
        height: e,
        depth: 1
      };
      n = Object.assign({
        generateMipmaps: false,
        internalFormat: null,
        minFilter: Qe,
        depthBuffer: true,
        stencilBuffer: false,
        resolveDepthBuffer: true,
        resolveStencilBuffer: true,
        depthTexture: null,
        samples: 0,
        count: 1
      }, n);
      const r = new we(s, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
      r.flipY = false, r.generateMipmaps = n.generateMipmaps, r.internalFormat = n.internalFormat, this.textures = [];
      const a = n.count;
      for (let o = 0; o < a; o++) this.textures[o] = r.clone(), this.textures[o].isRenderTargetTexture = true;
      this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.depthTexture = n.depthTexture, this.samples = n.samples;
    }
    get texture() {
      return this.textures[0];
    }
    set texture(t) {
      this.textures[0] = t;
    }
    setSize(t, e, n = 1) {
      if (this.width !== t || this.height !== e || this.depth !== n) {
        this.width = t, this.height = e, this.depth = n;
        for (let s = 0, r = this.textures.length; s < r; s++) this.textures[s].image.width = t, this.textures[s].image.height = e, this.textures[s].image.depth = n;
        this.dispose();
      }
      this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      this.width = t.width, this.height = t.height, this.depth = t.depth, this.scissor.copy(t.scissor), this.scissorTest = t.scissorTest, this.viewport.copy(t.viewport), this.textures.length = 0;
      for (let n = 0, s = t.textures.length; n < s; n++) this.textures[n] = t.textures[n].clone(), this.textures[n].isRenderTargetTexture = true;
      const e = Object.assign({}, t.texture.image);
      return this.texture.source = new Hc(e), this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
  }
  class Ze extends zd {
    constructor(t = 1, e = 1, n = {}) {
      super(t, e, n), this.isWebGLRenderTarget = true;
    }
  }
  class Gc extends we {
    constructor(t = null, e = 1, n = 1, s = 1) {
      super(null), this.isDataArrayTexture = true, this.image = {
        data: t,
        width: e,
        height: n,
        depth: s
      }, this.magFilter = Oe, this.minFilter = Oe, this.wrapR = Hn, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
    }
    addLayerUpdate(t) {
      this.layerUpdates.add(t);
    }
    clearLayerUpdates() {
      this.layerUpdates.clear();
    }
  }
  class kd extends we {
    constructor(t = null, e = 1, n = 1, s = 1) {
      super(null), this.isData3DTexture = true, this.image = {
        data: t,
        width: e,
        height: n,
        depth: s
      }, this.magFilter = Oe, this.minFilter = Oe, this.wrapR = Hn, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
    }
  }
  class qn {
    constructor(t = 0, e = 0, n = 0, s = 1) {
      this.isQuaternion = true, this._x = t, this._y = e, this._z = n, this._w = s;
    }
    static slerpFlat(t, e, n, s, r, a, o) {
      let l = n[s + 0], c = n[s + 1], h = n[s + 2], d = n[s + 3];
      const f = r[a + 0], p = r[a + 1], g = r[a + 2], v = r[a + 3];
      if (o === 0) {
        t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = d;
        return;
      }
      if (o === 1) {
        t[e + 0] = f, t[e + 1] = p, t[e + 2] = g, t[e + 3] = v;
        return;
      }
      if (d !== v || l !== f || c !== p || h !== g) {
        let m = 1 - o;
        const u = l * f + c * p + h * g + d * v, b = u >= 0 ? 1 : -1, E = 1 - u * u;
        if (E > Number.EPSILON) {
          const N = Math.sqrt(E), A = Math.atan2(N, u * b);
          m = Math.sin(m * A) / N, o = Math.sin(o * A) / N;
        }
        const S = o * b;
        if (l = l * m + f * S, c = c * m + p * S, h = h * m + g * S, d = d * m + v * S, m === 1 - o) {
          const N = 1 / Math.sqrt(l * l + c * c + h * h + d * d);
          l *= N, c *= N, h *= N, d *= N;
        }
      }
      t[e] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = d;
    }
    static multiplyQuaternionsFlat(t, e, n, s, r, a) {
      const o = n[s], l = n[s + 1], c = n[s + 2], h = n[s + 3], d = r[a], f = r[a + 1], p = r[a + 2], g = r[a + 3];
      return t[e] = o * g + h * d + l * p - c * f, t[e + 1] = l * g + h * f + c * d - o * p, t[e + 2] = c * g + h * p + o * f - l * d, t[e + 3] = h * g - o * d - l * f - c * p, t;
    }
    get x() {
      return this._x;
    }
    set x(t) {
      this._x = t, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(t) {
      this._y = t, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(t) {
      this._z = t, this._onChangeCallback();
    }
    get w() {
      return this._w;
    }
    set w(t) {
      this._w = t, this._onChangeCallback();
    }
    set(t, e, n, s) {
      return this._x = t, this._y = e, this._z = n, this._w = s, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(t) {
      return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), this;
    }
    setFromEuler(t, e = true) {
      const n = t._x, s = t._y, r = t._z, a = t._order, o = Math.cos, l = Math.sin, c = o(n / 2), h = o(s / 2), d = o(r / 2), f = l(n / 2), p = l(s / 2), g = l(r / 2);
      switch (a) {
        case "XYZ":
          this._x = f * h * d + c * p * g, this._y = c * p * d - f * h * g, this._z = c * h * g + f * p * d, this._w = c * h * d - f * p * g;
          break;
        case "YXZ":
          this._x = f * h * d + c * p * g, this._y = c * p * d - f * h * g, this._z = c * h * g - f * p * d, this._w = c * h * d + f * p * g;
          break;
        case "ZXY":
          this._x = f * h * d - c * p * g, this._y = c * p * d + f * h * g, this._z = c * h * g + f * p * d, this._w = c * h * d - f * p * g;
          break;
        case "ZYX":
          this._x = f * h * d - c * p * g, this._y = c * p * d + f * h * g, this._z = c * h * g - f * p * d, this._w = c * h * d + f * p * g;
          break;
        case "YZX":
          this._x = f * h * d + c * p * g, this._y = c * p * d + f * h * g, this._z = c * h * g - f * p * d, this._w = c * h * d - f * p * g;
          break;
        case "XZY":
          this._x = f * h * d - c * p * g, this._y = c * p * d - f * h * g, this._z = c * h * g + f * p * d, this._w = c * h * d + f * p * g;
          break;
        default:
          console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
      }
      return e === true && this._onChangeCallback(), this;
    }
    setFromAxisAngle(t, e) {
      const n = e / 2, s = Math.sin(n);
      return this._x = t.x * s, this._y = t.y * s, this._z = t.z * s, this._w = Math.cos(n), this._onChangeCallback(), this;
    }
    setFromRotationMatrix(t) {
      const e = t.elements, n = e[0], s = e[4], r = e[8], a = e[1], o = e[5], l = e[9], c = e[2], h = e[6], d = e[10], f = n + o + d;
      if (f > 0) {
        const p = 0.5 / Math.sqrt(f + 1);
        this._w = 0.25 / p, this._x = (h - l) * p, this._y = (r - c) * p, this._z = (a - s) * p;
      } else if (n > o && n > d) {
        const p = 2 * Math.sqrt(1 + n - o - d);
        this._w = (h - l) / p, this._x = 0.25 * p, this._y = (s + a) / p, this._z = (r + c) / p;
      } else if (o > d) {
        const p = 2 * Math.sqrt(1 + o - n - d);
        this._w = (r - c) / p, this._x = (s + a) / p, this._y = 0.25 * p, this._z = (l + h) / p;
      } else {
        const p = 2 * Math.sqrt(1 + d - n - o);
        this._w = (a - s) / p, this._x = (r + c) / p, this._y = (l + h) / p, this._z = 0.25 * p;
      }
      return this._onChangeCallback(), this;
    }
    setFromUnitVectors(t, e) {
      let n = t.dot(e) + 1;
      return n < Number.EPSILON ? (n = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, this._y = t.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -t.z, this._z = t.y, this._w = n)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, this._z = t.x * e.y - t.y * e.x, this._w = n), this.normalize();
    }
    angleTo(t) {
      return 2 * Math.acos(Math.abs(Ee(this.dot(t), -1, 1)));
    }
    rotateTowards(t, e) {
      const n = this.angleTo(t);
      if (n === 0) return this;
      const s = Math.min(1, e / n);
      return this.slerp(t, s), this;
    }
    identity() {
      return this.set(0, 0, 0, 1);
    }
    invert() {
      return this.conjugate();
    }
    conjugate() {
      return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
    }
    dot(t) {
      return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
    }
    lengthSq() {
      return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    length() {
      return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }
    normalize() {
      let t = this.length();
      return t === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), this._onChangeCallback(), this;
    }
    multiply(t) {
      return this.multiplyQuaternions(this, t);
    }
    premultiply(t) {
      return this.multiplyQuaternions(t, this);
    }
    multiplyQuaternions(t, e) {
      const n = t._x, s = t._y, r = t._z, a = t._w, o = e._x, l = e._y, c = e._z, h = e._w;
      return this._x = n * h + a * o + s * c - r * l, this._y = s * h + a * l + r * o - n * c, this._z = r * h + a * c + n * l - s * o, this._w = a * h - n * o - s * l - r * c, this._onChangeCallback(), this;
    }
    slerp(t, e) {
      if (e === 0) return this;
      if (e === 1) return this.copy(t);
      const n = this._x, s = this._y, r = this._z, a = this._w;
      let o = a * t._w + n * t._x + s * t._y + r * t._z;
      if (o < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, o = -o) : this.copy(t), o >= 1) return this._w = a, this._x = n, this._y = s, this._z = r, this;
      const l = 1 - o * o;
      if (l <= Number.EPSILON) {
        const p = 1 - e;
        return this._w = p * a + e * this._w, this._x = p * n + e * this._x, this._y = p * s + e * this._y, this._z = p * r + e * this._z, this.normalize(), this;
      }
      const c = Math.sqrt(l), h = Math.atan2(c, o), d = Math.sin((1 - e) * h) / c, f = Math.sin(e * h) / c;
      return this._w = a * d + this._w * f, this._x = n * d + this._x * f, this._y = s * d + this._y * f, this._z = r * d + this._z * f, this._onChangeCallback(), this;
    }
    slerpQuaternions(t, e, n) {
      return this.copy(t).slerp(e, n);
    }
    random() {
      const t = 2 * Math.PI * Math.random(), e = 2 * Math.PI * Math.random(), n = Math.random(), s = Math.sqrt(1 - n), r = Math.sqrt(n);
      return this.set(s * Math.sin(t), s * Math.cos(t), r * Math.sin(e), r * Math.cos(e));
    }
    equals(t) {
      return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w;
    }
    fromArray(t, e = 0) {
      return this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], this._onChangeCallback(), this;
    }
    toArray(t = [], e = 0) {
      return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, t;
    }
    fromBufferAttribute(t, e) {
      return this._x = t.getX(e), this._y = t.getY(e), this._z = t.getZ(e), this._w = t.getW(e), this._onChangeCallback(), this;
    }
    toJSON() {
      return this.toArray();
    }
    _onChange(t) {
      return this._onChangeCallback = t, this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._w;
    }
  }
  class R {
    constructor(t = 0, e = 0, n = 0) {
      R.prototype.isVector3 = true, this.x = t, this.y = e, this.z = n;
    }
    set(t, e, n) {
      return n === void 0 && (n = this.z), this.x = t, this.y = e, this.z = n, this;
    }
    setScalar(t) {
      return this.x = t, this.y = t, this.z = t, this;
    }
    setX(t) {
      return this.x = t, this;
    }
    setY(t) {
      return this.y = t, this;
    }
    setZ(t) {
      return this.z = t, this;
    }
    setComponent(t, e) {
      switch (t) {
        case 0:
          this.x = e;
          break;
        case 1:
          this.y = e;
          break;
        case 2:
          this.z = e;
          break;
        default:
          throw new Error("index is out of range: " + t);
      }
      return this;
    }
    getComponent(t) {
      switch (t) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + t);
      }
    }
    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }
    copy(t) {
      return this.x = t.x, this.y = t.y, this.z = t.z, this;
    }
    add(t) {
      return this.x += t.x, this.y += t.y, this.z += t.z, this;
    }
    addScalar(t) {
      return this.x += t, this.y += t, this.z += t, this;
    }
    addVectors(t, e) {
      return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this;
    }
    addScaledVector(t, e) {
      return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this;
    }
    sub(t) {
      return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
    }
    subScalar(t) {
      return this.x -= t, this.y -= t, this.z -= t, this;
    }
    subVectors(t, e) {
      return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this;
    }
    multiply(t) {
      return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
    }
    multiplyScalar(t) {
      return this.x *= t, this.y *= t, this.z *= t, this;
    }
    multiplyVectors(t, e) {
      return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this;
    }
    applyEuler(t) {
      return this.applyQuaternion(qo.setFromEuler(t));
    }
    applyAxisAngle(t, e) {
      return this.applyQuaternion(qo.setFromAxisAngle(t, e));
    }
    applyMatrix3(t) {
      const e = this.x, n = this.y, s = this.z, r = t.elements;
      return this.x = r[0] * e + r[3] * n + r[6] * s, this.y = r[1] * e + r[4] * n + r[7] * s, this.z = r[2] * e + r[5] * n + r[8] * s, this;
    }
    applyNormalMatrix(t) {
      return this.applyMatrix3(t).normalize();
    }
    applyMatrix4(t) {
      const e = this.x, n = this.y, s = this.z, r = t.elements, a = 1 / (r[3] * e + r[7] * n + r[11] * s + r[15]);
      return this.x = (r[0] * e + r[4] * n + r[8] * s + r[12]) * a, this.y = (r[1] * e + r[5] * n + r[9] * s + r[13]) * a, this.z = (r[2] * e + r[6] * n + r[10] * s + r[14]) * a, this;
    }
    applyQuaternion(t) {
      const e = this.x, n = this.y, s = this.z, r = t.x, a = t.y, o = t.z, l = t.w, c = 2 * (a * s - o * n), h = 2 * (o * e - r * s), d = 2 * (r * n - a * e);
      return this.x = e + l * c + a * d - o * h, this.y = n + l * h + o * c - r * d, this.z = s + l * d + r * h - a * c, this;
    }
    project(t) {
      return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
    }
    unproject(t) {
      return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
    }
    transformDirection(t) {
      const e = this.x, n = this.y, s = this.z, r = t.elements;
      return this.x = r[0] * e + r[4] * n + r[8] * s, this.y = r[1] * e + r[5] * n + r[9] * s, this.z = r[2] * e + r[6] * n + r[10] * s, this.normalize();
    }
    divide(t) {
      return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
    }
    divideScalar(t) {
      return this.multiplyScalar(1 / t);
    }
    min(t) {
      return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), this;
    }
    max(t) {
      return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), this;
    }
    clamp(t, e) {
      return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), this.z = Math.max(t.z, Math.min(e.z, this.z)), this;
    }
    clampScalar(t, e) {
      return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), this.z = Math.max(t, Math.min(e, this.z)), this;
    }
    clampLength(t, e) {
      const n = this.length();
      return this.divideScalar(n || 1).multiplyScalar(Math.max(t, Math.min(e, n)));
    }
    floor() {
      return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
    }
    ceil() {
      return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
    }
    round() {
      return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
    }
    roundToZero() {
      return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
    }
    negate() {
      return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
    }
    dot(t) {
      return this.x * t.x + this.y * t.y + this.z * t.z;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(t) {
      return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
      return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, this;
    }
    lerpVectors(t, e, n) {
      return this.x = t.x + (e.x - t.x) * n, this.y = t.y + (e.y - t.y) * n, this.z = t.z + (e.z - t.z) * n, this;
    }
    cross(t) {
      return this.crossVectors(this, t);
    }
    crossVectors(t, e) {
      const n = t.x, s = t.y, r = t.z, a = e.x, o = e.y, l = e.z;
      return this.x = s * l - r * o, this.y = r * a - n * l, this.z = n * o - s * a, this;
    }
    projectOnVector(t) {
      const e = t.lengthSq();
      if (e === 0) return this.set(0, 0, 0);
      const n = t.dot(this) / e;
      return this.copy(t).multiplyScalar(n);
    }
    projectOnPlane(t) {
      return cr.copy(this).projectOnVector(t), this.sub(cr);
    }
    reflect(t) {
      return this.sub(cr.copy(t).multiplyScalar(2 * this.dot(t)));
    }
    angleTo(t) {
      const e = Math.sqrt(this.lengthSq() * t.lengthSq());
      if (e === 0) return Math.PI / 2;
      const n = this.dot(t) / e;
      return Math.acos(Ee(n, -1, 1));
    }
    distanceTo(t) {
      return Math.sqrt(this.distanceToSquared(t));
    }
    distanceToSquared(t) {
      const e = this.x - t.x, n = this.y - t.y, s = this.z - t.z;
      return e * e + n * n + s * s;
    }
    manhattanDistanceTo(t) {
      return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
    }
    setFromSpherical(t) {
      return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
    }
    setFromSphericalCoords(t, e, n) {
      const s = Math.sin(e) * t;
      return this.x = s * Math.sin(n), this.y = Math.cos(e) * t, this.z = s * Math.cos(n), this;
    }
    setFromCylindrical(t) {
      return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
    }
    setFromCylindricalCoords(t, e, n) {
      return this.x = t * Math.sin(e), this.y = n, this.z = t * Math.cos(e), this;
    }
    setFromMatrixPosition(t) {
      const e = t.elements;
      return this.x = e[12], this.y = e[13], this.z = e[14], this;
    }
    setFromMatrixScale(t) {
      const e = this.setFromMatrixColumn(t, 0).length(), n = this.setFromMatrixColumn(t, 1).length(), s = this.setFromMatrixColumn(t, 2).length();
      return this.x = e, this.y = n, this.z = s, this;
    }
    setFromMatrixColumn(t, e) {
      return this.fromArray(t.elements, e * 4);
    }
    setFromMatrix3Column(t, e) {
      return this.fromArray(t.elements, e * 3);
    }
    setFromEuler(t) {
      return this.x = t._x, this.y = t._y, this.z = t._z, this;
    }
    setFromColor(t) {
      return this.x = t.r, this.y = t.g, this.z = t.b, this;
    }
    equals(t) {
      return t.x === this.x && t.y === this.y && t.z === this.z;
    }
    fromArray(t, e = 0) {
      return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this;
    }
    toArray(t = [], e = 0) {
      return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t;
    }
    fromBufferAttribute(t, e) {
      return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this;
    }
    random() {
      return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
    }
    randomDirection() {
      const t = Math.random() * Math.PI * 2, e = Math.random() * 2 - 1, n = Math.sqrt(1 - e * e);
      return this.x = n * Math.cos(t), this.y = e, this.z = n * Math.sin(t), this;
    }
    *[Symbol.iterator]() {
      yield this.x, yield this.y, yield this.z;
    }
  }
  const cr = new R(), qo = new qn();
  class Kn {
    constructor(t = new R(1 / 0, 1 / 0, 1 / 0), e = new R(-1 / 0, -1 / 0, -1 / 0)) {
      this.isBox3 = true, this.min = t, this.max = e;
    }
    set(t, e) {
      return this.min.copy(t), this.max.copy(e), this;
    }
    setFromArray(t) {
      this.makeEmpty();
      for (let e = 0, n = t.length; e < n; e += 3) this.expandByPoint(Ve.fromArray(t, e));
      return this;
    }
    setFromBufferAttribute(t) {
      this.makeEmpty();
      for (let e = 0, n = t.count; e < n; e++) this.expandByPoint(Ve.fromBufferAttribute(t, e));
      return this;
    }
    setFromPoints(t) {
      this.makeEmpty();
      for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
      return this;
    }
    setFromCenterAndSize(t, e) {
      const n = Ve.copy(e).multiplyScalar(0.5);
      return this.min.copy(t).sub(n), this.max.copy(t).add(n), this;
    }
    setFromObject(t, e = false) {
      return this.makeEmpty(), this.expandByObject(t, e);
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return this.min.copy(t.min), this.max.copy(t.max), this;
    }
    makeEmpty() {
      return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
    }
    isEmpty() {
      return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    getCenter(t) {
      return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(0.5);
    }
    getSize(t) {
      return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
    }
    expandByPoint(t) {
      return this.min.min(t), this.max.max(t), this;
    }
    expandByVector(t) {
      return this.min.sub(t), this.max.add(t), this;
    }
    expandByScalar(t) {
      return this.min.addScalar(-t), this.max.addScalar(t), this;
    }
    expandByObject(t, e = false) {
      t.updateWorldMatrix(false, false);
      const n = t.geometry;
      if (n !== void 0) {
        const r = n.getAttribute("position");
        if (e === true && r !== void 0 && t.isInstancedMesh !== true) for (let a = 0, o = r.count; a < o; a++) t.isMesh === true ? t.getVertexPosition(a, Ve) : Ve.fromBufferAttribute(r, a), Ve.applyMatrix4(t.matrixWorld), this.expandByPoint(Ve);
        else t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), ds.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), ds.copy(n.boundingBox)), ds.applyMatrix4(t.matrixWorld), this.union(ds);
      }
      const s = t.children;
      for (let r = 0, a = s.length; r < a; r++) this.expandByObject(s[r], e);
      return this;
    }
    containsPoint(t) {
      return t.x >= this.min.x && t.x <= this.max.x && t.y >= this.min.y && t.y <= this.max.y && t.z >= this.min.z && t.z <= this.max.z;
    }
    containsBox(t) {
      return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z;
    }
    getParameter(t, e) {
      return e.set((t.x - this.min.x) / (this.max.x - this.min.x), (t.y - this.min.y) / (this.max.y - this.min.y), (t.z - this.min.z) / (this.max.z - this.min.z));
    }
    intersectsBox(t) {
      return t.max.x >= this.min.x && t.min.x <= this.max.x && t.max.y >= this.min.y && t.min.y <= this.max.y && t.max.z >= this.min.z && t.min.z <= this.max.z;
    }
    intersectsSphere(t) {
      return this.clampPoint(t.center, Ve), Ve.distanceToSquared(t.center) <= t.radius * t.radius;
    }
    intersectsPlane(t) {
      let e, n;
      return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
    }
    intersectsTriangle(t) {
      if (this.isEmpty()) return false;
      this.getCenter(Hi), fs.subVectors(this.max, Hi), ei.subVectors(t.a, Hi), ni.subVectors(t.b, Hi), ii.subVectors(t.c, Hi), xn.subVectors(ni, ei), Mn.subVectors(ii, ni), In.subVectors(ei, ii);
      let e = [
        0,
        -xn.z,
        xn.y,
        0,
        -Mn.z,
        Mn.y,
        0,
        -In.z,
        In.y,
        xn.z,
        0,
        -xn.x,
        Mn.z,
        0,
        -Mn.x,
        In.z,
        0,
        -In.x,
        -xn.y,
        xn.x,
        0,
        -Mn.y,
        Mn.x,
        0,
        -In.y,
        In.x,
        0
      ];
      return !hr(e, ei, ni, ii, fs) || (e = [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ], !hr(e, ei, ni, ii, fs)) ? false : (ps.crossVectors(xn, Mn), e = [
        ps.x,
        ps.y,
        ps.z
      ], hr(e, ei, ni, ii, fs));
    }
    clampPoint(t, e) {
      return e.copy(t).clamp(this.min, this.max);
    }
    distanceToPoint(t) {
      return this.clampPoint(t, Ve).distanceTo(t);
    }
    getBoundingSphere(t) {
      return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(Ve).length() * 0.5), t;
    }
    intersect(t) {
      return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
    }
    union(t) {
      return this.min.min(t.min), this.max.max(t.max), this;
    }
    applyMatrix4(t) {
      return this.isEmpty() ? this : (an[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), an[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), an[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), an[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), an[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), an[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), an[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), an[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(an), this);
    }
    translate(t) {
      return this.min.add(t), this.max.add(t), this;
    }
    equals(t) {
      return t.min.equals(this.min) && t.max.equals(this.max);
    }
  }
  const an = [
    new R(),
    new R(),
    new R(),
    new R(),
    new R(),
    new R(),
    new R(),
    new R()
  ], Ve = new R(), ds = new Kn(), ei = new R(), ni = new R(), ii = new R(), xn = new R(), Mn = new R(), In = new R(), Hi = new R(), fs = new R(), ps = new R(), Ln = new R();
  function hr(i, t, e, n, s) {
    for (let r = 0, a = i.length - 3; r <= a; r += 3) {
      Ln.fromArray(i, r);
      const o = s.x * Math.abs(Ln.x) + s.y * Math.abs(Ln.y) + s.z * Math.abs(Ln.z), l = t.dot(Ln), c = e.dot(Ln), h = n.dot(Ln);
      if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o) return false;
    }
    return true;
  }
  const Hd = new Kn(), Gi = new R(), ur = new R();
  class Zn {
    constructor(t = new R(), e = -1) {
      this.isSphere = true, this.center = t, this.radius = e;
    }
    set(t, e) {
      return this.center.copy(t), this.radius = e, this;
    }
    setFromPoints(t, e) {
      const n = this.center;
      e !== void 0 ? n.copy(e) : Hd.setFromPoints(t).getCenter(n);
      let s = 0;
      for (let r = 0, a = t.length; r < a; r++) s = Math.max(s, n.distanceToSquared(t[r]));
      return this.radius = Math.sqrt(s), this;
    }
    copy(t) {
      return this.center.copy(t.center), this.radius = t.radius, this;
    }
    isEmpty() {
      return this.radius < 0;
    }
    makeEmpty() {
      return this.center.set(0, 0, 0), this.radius = -1, this;
    }
    containsPoint(t) {
      return t.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(t) {
      return t.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(t) {
      const e = this.radius + t.radius;
      return t.center.distanceToSquared(this.center) <= e * e;
    }
    intersectsBox(t) {
      return t.intersectsSphere(this);
    }
    intersectsPlane(t) {
      return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(t, e) {
      const n = this.center.distanceToSquared(t);
      return e.copy(t), n > this.radius * this.radius && (e.sub(this.center).normalize(), e.multiplyScalar(this.radius).add(this.center)), e;
    }
    getBoundingBox(t) {
      return this.isEmpty() ? (t.makeEmpty(), t) : (t.set(this.center, this.center), t.expandByScalar(this.radius), t);
    }
    applyMatrix4(t) {
      return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), this;
    }
    translate(t) {
      return this.center.add(t), this;
    }
    expandByPoint(t) {
      if (this.isEmpty()) return this.center.copy(t), this.radius = 0, this;
      Gi.subVectors(t, this.center);
      const e = Gi.lengthSq();
      if (e > this.radius * this.radius) {
        const n = Math.sqrt(e), s = (n - this.radius) * 0.5;
        this.center.addScaledVector(Gi, s / n), this.radius += s;
      }
      return this;
    }
    union(t) {
      return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === true ? this.radius = Math.max(this.radius, t.radius) : (ur.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(Gi.copy(t.center).add(ur)), this.expandByPoint(Gi.copy(t.center).sub(ur))), this);
    }
    equals(t) {
      return t.center.equals(this.center) && t.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const on = new R(), dr = new R(), ms = new R(), Sn = new R(), fr = new R(), gs = new R(), pr = new R();
  class is {
    constructor(t = new R(), e = new R(0, 0, -1)) {
      this.origin = t, this.direction = e;
    }
    set(t, e) {
      return this.origin.copy(t), this.direction.copy(e), this;
    }
    copy(t) {
      return this.origin.copy(t.origin), this.direction.copy(t.direction), this;
    }
    at(t, e) {
      return e.copy(this.origin).addScaledVector(this.direction, t);
    }
    lookAt(t) {
      return this.direction.copy(t).sub(this.origin).normalize(), this;
    }
    recast(t) {
      return this.origin.copy(this.at(t, on)), this;
    }
    closestPointToPoint(t, e) {
      e.subVectors(t, this.origin);
      const n = e.dot(this.direction);
      return n < 0 ? e.copy(this.origin) : e.copy(this.origin).addScaledVector(this.direction, n);
    }
    distanceToPoint(t) {
      return Math.sqrt(this.distanceSqToPoint(t));
    }
    distanceSqToPoint(t) {
      const e = on.subVectors(t, this.origin).dot(this.direction);
      return e < 0 ? this.origin.distanceToSquared(t) : (on.copy(this.origin).addScaledVector(this.direction, e), on.distanceToSquared(t));
    }
    distanceSqToSegment(t, e, n, s) {
      dr.copy(t).add(e).multiplyScalar(0.5), ms.copy(e).sub(t).normalize(), Sn.copy(this.origin).sub(dr);
      const r = t.distanceTo(e) * 0.5, a = -this.direction.dot(ms), o = Sn.dot(this.direction), l = -Sn.dot(ms), c = Sn.lengthSq(), h = Math.abs(1 - a * a);
      let d, f, p, g;
      if (h > 0) if (d = a * l - o, f = a * o - l, g = r * h, d >= 0) if (f >= -g) if (f <= g) {
        const v = 1 / h;
        d *= v, f *= v, p = d * (d + a * f + 2 * o) + f * (a * d + f + 2 * l) + c;
      } else f = r, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
      else f = -r, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
      else f <= -g ? (d = Math.max(0, -(-a * r + o)), f = d > 0 ? -r : Math.min(Math.max(-r, -l), r), p = -d * d + f * (f + 2 * l) + c) : f <= g ? (d = 0, f = Math.min(Math.max(-r, -l), r), p = f * (f + 2 * l) + c) : (d = Math.max(0, -(a * r + o)), f = d > 0 ? r : Math.min(Math.max(-r, -l), r), p = -d * d + f * (f + 2 * l) + c);
      else f = a > 0 ? -r : r, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
      return n && n.copy(this.origin).addScaledVector(this.direction, d), s && s.copy(dr).addScaledVector(ms, f), p;
    }
    intersectSphere(t, e) {
      on.subVectors(t.center, this.origin);
      const n = on.dot(this.direction), s = on.dot(on) - n * n, r = t.radius * t.radius;
      if (s > r) return null;
      const a = Math.sqrt(r - s), o = n - a, l = n + a;
      return l < 0 ? null : o < 0 ? this.at(l, e) : this.at(o, e);
    }
    intersectsSphere(t) {
      return this.distanceSqToPoint(t.center) <= t.radius * t.radius;
    }
    distanceToPlane(t) {
      const e = t.normal.dot(this.direction);
      if (e === 0) return t.distanceToPoint(this.origin) === 0 ? 0 : null;
      const n = -(this.origin.dot(t.normal) + t.constant) / e;
      return n >= 0 ? n : null;
    }
    intersectPlane(t, e) {
      const n = this.distanceToPlane(t);
      return n === null ? null : this.at(n, e);
    }
    intersectsPlane(t) {
      const e = t.distanceToPoint(this.origin);
      return e === 0 || t.normal.dot(this.direction) * e < 0;
    }
    intersectBox(t, e) {
      let n, s, r, a, o, l;
      const c = 1 / this.direction.x, h = 1 / this.direction.y, d = 1 / this.direction.z, f = this.origin;
      return c >= 0 ? (n = (t.min.x - f.x) * c, s = (t.max.x - f.x) * c) : (n = (t.max.x - f.x) * c, s = (t.min.x - f.x) * c), h >= 0 ? (r = (t.min.y - f.y) * h, a = (t.max.y - f.y) * h) : (r = (t.max.y - f.y) * h, a = (t.min.y - f.y) * h), n > a || r > s || ((r > n || isNaN(n)) && (n = r), (a < s || isNaN(s)) && (s = a), d >= 0 ? (o = (t.min.z - f.z) * d, l = (t.max.z - f.z) * d) : (o = (t.max.z - f.z) * d, l = (t.min.z - f.z) * d), n > l || o > s) || ((o > n || n !== n) && (n = o), (l < s || s !== s) && (s = l), s < 0) ? null : this.at(n >= 0 ? n : s, e);
    }
    intersectsBox(t) {
      return this.intersectBox(t, on) !== null;
    }
    intersectTriangle(t, e, n, s, r) {
      fr.subVectors(e, t), gs.subVectors(n, t), pr.crossVectors(fr, gs);
      let a = this.direction.dot(pr), o;
      if (a > 0) {
        if (s) return null;
        o = 1;
      } else if (a < 0) o = -1, a = -a;
      else return null;
      Sn.subVectors(this.origin, t);
      const l = o * this.direction.dot(gs.crossVectors(Sn, gs));
      if (l < 0) return null;
      const c = o * this.direction.dot(fr.cross(Sn));
      if (c < 0 || l + c > a) return null;
      const h = -o * Sn.dot(pr);
      return h < 0 ? null : this.at(h / a, r);
    }
    applyMatrix4(t) {
      return this.origin.applyMatrix4(t), this.direction.transformDirection(t), this;
    }
    equals(t) {
      return t.origin.equals(this.origin) && t.direction.equals(this.direction);
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  class Zt {
    constructor(t, e, n, s, r, a, o, l, c, h, d, f, p, g, v, m) {
      Zt.prototype.isMatrix4 = true, this.elements = [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ], t !== void 0 && this.set(t, e, n, s, r, a, o, l, c, h, d, f, p, g, v, m);
    }
    set(t, e, n, s, r, a, o, l, c, h, d, f, p, g, v, m) {
      const u = this.elements;
      return u[0] = t, u[4] = e, u[8] = n, u[12] = s, u[1] = r, u[5] = a, u[9] = o, u[13] = l, u[2] = c, u[6] = h, u[10] = d, u[14] = f, u[3] = p, u[7] = g, u[11] = v, u[15] = m, this;
    }
    identity() {
      return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    clone() {
      return new Zt().fromArray(this.elements);
    }
    copy(t) {
      const e = this.elements, n = t.elements;
      return e[0] = n[0], e[1] = n[1], e[2] = n[2], e[3] = n[3], e[4] = n[4], e[5] = n[5], e[6] = n[6], e[7] = n[7], e[8] = n[8], e[9] = n[9], e[10] = n[10], e[11] = n[11], e[12] = n[12], e[13] = n[13], e[14] = n[14], e[15] = n[15], this;
    }
    copyPosition(t) {
      const e = this.elements, n = t.elements;
      return e[12] = n[12], e[13] = n[13], e[14] = n[14], this;
    }
    setFromMatrix3(t) {
      const e = t.elements;
      return this.set(e[0], e[3], e[6], 0, e[1], e[4], e[7], 0, e[2], e[5], e[8], 0, 0, 0, 0, 1), this;
    }
    extractBasis(t, e, n) {
      return t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
    }
    makeBasis(t, e, n) {
      return this.set(t.x, e.x, n.x, 0, t.y, e.y, n.y, 0, t.z, e.z, n.z, 0, 0, 0, 0, 1), this;
    }
    extractRotation(t) {
      const e = this.elements, n = t.elements, s = 1 / si.setFromMatrixColumn(t, 0).length(), r = 1 / si.setFromMatrixColumn(t, 1).length(), a = 1 / si.setFromMatrixColumn(t, 2).length();
      return e[0] = n[0] * s, e[1] = n[1] * s, e[2] = n[2] * s, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * a, e[9] = n[9] * a, e[10] = n[10] * a, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
    }
    makeRotationFromEuler(t) {
      const e = this.elements, n = t.x, s = t.y, r = t.z, a = Math.cos(n), o = Math.sin(n), l = Math.cos(s), c = Math.sin(s), h = Math.cos(r), d = Math.sin(r);
      if (t.order === "XYZ") {
        const f = a * h, p = a * d, g = o * h, v = o * d;
        e[0] = l * h, e[4] = -l * d, e[8] = c, e[1] = p + g * c, e[5] = f - v * c, e[9] = -o * l, e[2] = v - f * c, e[6] = g + p * c, e[10] = a * l;
      } else if (t.order === "YXZ") {
        const f = l * h, p = l * d, g = c * h, v = c * d;
        e[0] = f + v * o, e[4] = g * o - p, e[8] = a * c, e[1] = a * d, e[5] = a * h, e[9] = -o, e[2] = p * o - g, e[6] = v + f * o, e[10] = a * l;
      } else if (t.order === "ZXY") {
        const f = l * h, p = l * d, g = c * h, v = c * d;
        e[0] = f - v * o, e[4] = -a * d, e[8] = g + p * o, e[1] = p + g * o, e[5] = a * h, e[9] = v - f * o, e[2] = -a * c, e[6] = o, e[10] = a * l;
      } else if (t.order === "ZYX") {
        const f = a * h, p = a * d, g = o * h, v = o * d;
        e[0] = l * h, e[4] = g * c - p, e[8] = f * c + v, e[1] = l * d, e[5] = v * c + f, e[9] = p * c - g, e[2] = -c, e[6] = o * l, e[10] = a * l;
      } else if (t.order === "YZX") {
        const f = a * l, p = a * c, g = o * l, v = o * c;
        e[0] = l * h, e[4] = v - f * d, e[8] = g * d + p, e[1] = d, e[5] = a * h, e[9] = -o * h, e[2] = -c * h, e[6] = p * d + g, e[10] = f - v * d;
      } else if (t.order === "XZY") {
        const f = a * l, p = a * c, g = o * l, v = o * c;
        e[0] = l * h, e[4] = -d, e[8] = c * h, e[1] = f * d + v, e[5] = a * h, e[9] = p * d - g, e[2] = g * d - p, e[6] = o * h, e[10] = v * d + f;
      }
      return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
    }
    makeRotationFromQuaternion(t) {
      return this.compose(Gd, t, Vd);
    }
    lookAt(t, e, n) {
      const s = this.elements;
      return Ue.subVectors(t, e), Ue.lengthSq() === 0 && (Ue.z = 1), Ue.normalize(), yn.crossVectors(n, Ue), yn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Ue.x += 1e-4 : Ue.z += 1e-4, Ue.normalize(), yn.crossVectors(n, Ue)), yn.normalize(), _s.crossVectors(Ue, yn), s[0] = yn.x, s[4] = _s.x, s[8] = Ue.x, s[1] = yn.y, s[5] = _s.y, s[9] = Ue.y, s[2] = yn.z, s[6] = _s.z, s[10] = Ue.z, this;
    }
    multiply(t) {
      return this.multiplyMatrices(this, t);
    }
    premultiply(t) {
      return this.multiplyMatrices(t, this);
    }
    multiplyMatrices(t, e) {
      const n = t.elements, s = e.elements, r = this.elements, a = n[0], o = n[4], l = n[8], c = n[12], h = n[1], d = n[5], f = n[9], p = n[13], g = n[2], v = n[6], m = n[10], u = n[14], b = n[3], E = n[7], S = n[11], N = n[15], A = s[0], w = s[4], P = s[8], y = s[12], x = s[1], C = s[5], k = s[9], z = s[13], V = s[2], Z = s[6], W = s[10], tt = s[14], G = s[3], st = s[7], ht = s[11], St = s[15];
      return r[0] = a * A + o * x + l * V + c * G, r[4] = a * w + o * C + l * Z + c * st, r[8] = a * P + o * k + l * W + c * ht, r[12] = a * y + o * z + l * tt + c * St, r[1] = h * A + d * x + f * V + p * G, r[5] = h * w + d * C + f * Z + p * st, r[9] = h * P + d * k + f * W + p * ht, r[13] = h * y + d * z + f * tt + p * St, r[2] = g * A + v * x + m * V + u * G, r[6] = g * w + v * C + m * Z + u * st, r[10] = g * P + v * k + m * W + u * ht, r[14] = g * y + v * z + m * tt + u * St, r[3] = b * A + E * x + S * V + N * G, r[7] = b * w + E * C + S * Z + N * st, r[11] = b * P + E * k + S * W + N * ht, r[15] = b * y + E * z + S * tt + N * St, this;
    }
    multiplyScalar(t) {
      const e = this.elements;
      return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
    }
    determinant() {
      const t = this.elements, e = t[0], n = t[4], s = t[8], r = t[12], a = t[1], o = t[5], l = t[9], c = t[13], h = t[2], d = t[6], f = t[10], p = t[14], g = t[3], v = t[7], m = t[11], u = t[15];
      return g * (+r * l * d - s * c * d - r * o * f + n * c * f + s * o * p - n * l * p) + v * (+e * l * p - e * c * f + r * a * f - s * a * p + s * c * h - r * l * h) + m * (+e * c * d - e * o * p - r * a * d + n * a * p + r * o * h - n * c * h) + u * (-s * o * h - e * l * d + e * o * f + s * a * d - n * a * f + n * l * h);
    }
    transpose() {
      const t = this.elements;
      let e;
      return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this;
    }
    setPosition(t, e, n) {
      const s = this.elements;
      return t.isVector3 ? (s[12] = t.x, s[13] = t.y, s[14] = t.z) : (s[12] = t, s[13] = e, s[14] = n), this;
    }
    invert() {
      const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], d = t[9], f = t[10], p = t[11], g = t[12], v = t[13], m = t[14], u = t[15], b = d * m * c - v * f * c + v * l * p - o * m * p - d * l * u + o * f * u, E = g * f * c - h * m * c - g * l * p + a * m * p + h * l * u - a * f * u, S = h * v * c - g * d * c + g * o * p - a * v * p - h * o * u + a * d * u, N = g * d * l - h * v * l - g * o * f + a * v * f + h * o * m - a * d * m, A = e * b + n * E + s * S + r * N;
      if (A === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      const w = 1 / A;
      return t[0] = b * w, t[1] = (v * f * r - d * m * r - v * s * p + n * m * p + d * s * u - n * f * u) * w, t[2] = (o * m * r - v * l * r + v * s * c - n * m * c - o * s * u + n * l * u) * w, t[3] = (d * l * r - o * f * r - d * s * c + n * f * c + o * s * p - n * l * p) * w, t[4] = E * w, t[5] = (h * m * r - g * f * r + g * s * p - e * m * p - h * s * u + e * f * u) * w, t[6] = (g * l * r - a * m * r - g * s * c + e * m * c + a * s * u - e * l * u) * w, t[7] = (a * f * r - h * l * r + h * s * c - e * f * c - a * s * p + e * l * p) * w, t[8] = S * w, t[9] = (g * d * r - h * v * r - g * n * p + e * v * p + h * n * u - e * d * u) * w, t[10] = (a * v * r - g * o * r + g * n * c - e * v * c - a * n * u + e * o * u) * w, t[11] = (h * o * r - a * d * r - h * n * c + e * d * c + a * n * p - e * o * p) * w, t[12] = N * w, t[13] = (h * v * s - g * d * s + g * n * f - e * v * f - h * n * m + e * d * m) * w, t[14] = (g * o * s - a * v * s - g * n * l + e * v * l + a * n * m - e * o * m) * w, t[15] = (a * d * s - h * o * s + h * n * l - e * d * l - a * n * f + e * o * f) * w, this;
    }
    scale(t) {
      const e = this.elements, n = t.x, s = t.y, r = t.z;
      return e[0] *= n, e[4] *= s, e[8] *= r, e[1] *= n, e[5] *= s, e[9] *= r, e[2] *= n, e[6] *= s, e[10] *= r, e[3] *= n, e[7] *= s, e[11] *= r, this;
    }
    getMaxScaleOnAxis() {
      const t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], n = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], s = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
      return Math.sqrt(Math.max(e, n, s));
    }
    makeTranslation(t, e, n) {
      return t.isVector3 ? this.set(1, 0, 0, t.x, 0, 1, 0, t.y, 0, 0, 1, t.z, 0, 0, 0, 1) : this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, n, 0, 0, 0, 1), this;
    }
    makeRotationX(t) {
      const e = Math.cos(t), n = Math.sin(t);
      return this.set(1, 0, 0, 0, 0, e, -n, 0, 0, n, e, 0, 0, 0, 0, 1), this;
    }
    makeRotationY(t) {
      const e = Math.cos(t), n = Math.sin(t);
      return this.set(e, 0, n, 0, 0, 1, 0, 0, -n, 0, e, 0, 0, 0, 0, 1), this;
    }
    makeRotationZ(t) {
      const e = Math.cos(t), n = Math.sin(t);
      return this.set(e, -n, 0, 0, n, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    makeRotationAxis(t, e) {
      const n = Math.cos(e), s = Math.sin(e), r = 1 - n, a = t.x, o = t.y, l = t.z, c = r * a, h = r * o;
      return this.set(c * a + n, c * o - s * l, c * l + s * o, 0, c * o + s * l, h * o + n, h * l - s * a, 0, c * l - s * o, h * l + s * a, r * l * l + n, 0, 0, 0, 0, 1), this;
    }
    makeScale(t, e, n) {
      return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, n, 0, 0, 0, 0, 1), this;
    }
    makeShear(t, e, n, s, r, a) {
      return this.set(1, n, r, 0, t, 1, a, 0, e, s, 1, 0, 0, 0, 0, 1), this;
    }
    compose(t, e, n) {
      const s = this.elements, r = e._x, a = e._y, o = e._z, l = e._w, c = r + r, h = a + a, d = o + o, f = r * c, p = r * h, g = r * d, v = a * h, m = a * d, u = o * d, b = l * c, E = l * h, S = l * d, N = n.x, A = n.y, w = n.z;
      return s[0] = (1 - (v + u)) * N, s[1] = (p + S) * N, s[2] = (g - E) * N, s[3] = 0, s[4] = (p - S) * A, s[5] = (1 - (f + u)) * A, s[6] = (m + b) * A, s[7] = 0, s[8] = (g + E) * w, s[9] = (m - b) * w, s[10] = (1 - (f + v)) * w, s[11] = 0, s[12] = t.x, s[13] = t.y, s[14] = t.z, s[15] = 1, this;
    }
    decompose(t, e, n) {
      const s = this.elements;
      let r = si.set(s[0], s[1], s[2]).length();
      const a = si.set(s[4], s[5], s[6]).length(), o = si.set(s[8], s[9], s[10]).length();
      this.determinant() < 0 && (r = -r), t.x = s[12], t.y = s[13], t.z = s[14], We.copy(this);
      const c = 1 / r, h = 1 / a, d = 1 / o;
      return We.elements[0] *= c, We.elements[1] *= c, We.elements[2] *= c, We.elements[4] *= h, We.elements[5] *= h, We.elements[6] *= h, We.elements[8] *= d, We.elements[9] *= d, We.elements[10] *= d, e.setFromRotationMatrix(We), n.x = r, n.y = a, n.z = o, this;
    }
    makePerspective(t, e, n, s, r, a, o = dn) {
      const l = this.elements, c = 2 * r / (e - t), h = 2 * r / (n - s), d = (e + t) / (e - t), f = (n + s) / (n - s);
      let p, g;
      if (o === dn) p = -(a + r) / (a - r), g = -2 * a * r / (a - r);
      else if (o === qs) p = -a / (a - r), g = -a * r / (a - r);
      else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
      return l[0] = c, l[4] = 0, l[8] = d, l[12] = 0, l[1] = 0, l[5] = h, l[9] = f, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = p, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
    }
    makeOrthographic(t, e, n, s, r, a, o = dn) {
      const l = this.elements, c = 1 / (e - t), h = 1 / (n - s), d = 1 / (a - r), f = (e + t) * c, p = (n + s) * h;
      let g, v;
      if (o === dn) g = (a + r) * d, v = -2 * d;
      else if (o === qs) g = r * d, v = -1 * d;
      else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
      return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -f, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -p, l[2] = 0, l[6] = 0, l[10] = v, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
    }
    equals(t) {
      const e = this.elements, n = t.elements;
      for (let s = 0; s < 16; s++) if (e[s] !== n[s]) return false;
      return true;
    }
    fromArray(t, e = 0) {
      for (let n = 0; n < 16; n++) this.elements[n] = t[n + e];
      return this;
    }
    toArray(t = [], e = 0) {
      const n = this.elements;
      return t[e] = n[0], t[e + 1] = n[1], t[e + 2] = n[2], t[e + 3] = n[3], t[e + 4] = n[4], t[e + 5] = n[5], t[e + 6] = n[6], t[e + 7] = n[7], t[e + 8] = n[8], t[e + 9] = n[9], t[e + 10] = n[10], t[e + 11] = n[11], t[e + 12] = n[12], t[e + 13] = n[13], t[e + 14] = n[14], t[e + 15] = n[15], t;
    }
  }
  const si = new R(), We = new Zt(), Gd = new R(0, 0, 0), Vd = new R(1, 1, 1), yn = new R(), _s = new R(), Ue = new R(), Yo = new Zt(), jo = new qn();
  class nn {
    constructor(t = 0, e = 0, n = 0, s = nn.DEFAULT_ORDER) {
      this.isEuler = true, this._x = t, this._y = e, this._z = n, this._order = s;
    }
    get x() {
      return this._x;
    }
    set x(t) {
      this._x = t, this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(t) {
      this._y = t, this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(t) {
      this._z = t, this._onChangeCallback();
    }
    get order() {
      return this._order;
    }
    set order(t) {
      this._order = t, this._onChangeCallback();
    }
    set(t, e, n, s = this._order) {
      return this._x = t, this._y = e, this._z = n, this._order = s, this._onChangeCallback(), this;
    }
    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(t) {
      return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), this;
    }
    setFromRotationMatrix(t, e = this._order, n = true) {
      const s = t.elements, r = s[0], a = s[4], o = s[8], l = s[1], c = s[5], h = s[9], d = s[2], f = s[6], p = s[10];
      switch (e) {
        case "XYZ":
          this._y = Math.asin(Ee(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(f, c), this._z = 0);
          break;
        case "YXZ":
          this._x = Math.asin(-Ee(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, r), this._z = 0);
          break;
        case "ZXY":
          this._x = Math.asin(Ee(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-d, p), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, r));
          break;
        case "ZYX":
          this._y = Math.asin(-Ee(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(f, p), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-a, c));
          break;
        case "YZX":
          this._z = Math.asin(Ee(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, r)) : (this._x = 0, this._y = Math.atan2(o, p));
          break;
        case "XZY":
          this._z = Math.asin(-Ee(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, c), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, p), this._y = 0);
          break;
        default:
          console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
      }
      return this._order = e, n === true && this._onChangeCallback(), this;
    }
    setFromQuaternion(t, e, n) {
      return Yo.makeRotationFromQuaternion(t), this.setFromRotationMatrix(Yo, e, n);
    }
    setFromVector3(t, e = this._order) {
      return this.set(t.x, t.y, t.z, e);
    }
    reorder(t) {
      return jo.setFromEuler(this), this.setFromQuaternion(jo, t);
    }
    equals(t) {
      return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
    }
    fromArray(t) {
      return this._x = t[0], this._y = t[1], this._z = t[2], t[3] !== void 0 && (this._order = t[3]), this._onChangeCallback(), this;
    }
    toArray(t = [], e = 0) {
      return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, t;
    }
    _onChange(t) {
      return this._onChangeCallback = t, this;
    }
    _onChangeCallback() {
    }
    *[Symbol.iterator]() {
      yield this._x, yield this._y, yield this._z, yield this._order;
    }
  }
  nn.DEFAULT_ORDER = "XYZ";
  class Ya {
    constructor() {
      this.mask = 1;
    }
    set(t) {
      this.mask = (1 << t | 0) >>> 0;
    }
    enable(t) {
      this.mask |= 1 << t | 0;
    }
    enableAll() {
      this.mask = -1;
    }
    toggle(t) {
      this.mask ^= 1 << t | 0;
    }
    disable(t) {
      this.mask &= ~(1 << t | 0);
    }
    disableAll() {
      this.mask = 0;
    }
    test(t) {
      return (this.mask & t.mask) !== 0;
    }
    isEnabled(t) {
      return (this.mask & (1 << t | 0)) !== 0;
    }
  }
  let Wd = 0;
  const Ko = new R(), ri = new qn(), ln = new Zt(), vs = new R(), Vi = new R(), Xd = new R(), qd = new qn(), Zo = new R(1, 0, 0), $o = new R(0, 1, 0), Jo = new R(0, 0, 1), Qo = {
    type: "added"
  }, Yd = {
    type: "removed"
  }, ai = {
    type: "childadded",
    child: null
  }, mr = {
    type: "childremoved",
    child: null
  };
  class ve extends jn {
    constructor() {
      super(), this.isObject3D = true, Object.defineProperty(this, "id", {
        value: Wd++
      }), this.uuid = Li(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = ve.DEFAULT_UP.clone();
      const t = new R(), e = new nn(), n = new qn(), s = new R(1, 1, 1);
      function r() {
        n.setFromEuler(e, false);
      }
      function a() {
        e.setFromQuaternion(n, void 0, false);
      }
      e._onChange(r), n._onChange(a), Object.defineProperties(this, {
        position: {
          configurable: true,
          enumerable: true,
          value: t
        },
        rotation: {
          configurable: true,
          enumerable: true,
          value: e
        },
        quaternion: {
          configurable: true,
          enumerable: true,
          value: n
        },
        scale: {
          configurable: true,
          enumerable: true,
          value: s
        },
        modelViewMatrix: {
          value: new Zt()
        },
        normalMatrix: {
          value: new Ut()
        }
      }), this.matrix = new Zt(), this.matrixWorld = new Zt(), this.matrixAutoUpdate = ve.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = ve.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = false, this.layers = new Ya(), this.visible = true, this.castShadow = false, this.receiveShadow = false, this.frustumCulled = true, this.renderOrder = 0, this.animations = [], this.userData = {};
    }
    onBeforeShadow() {
    }
    onAfterShadow() {
    }
    onBeforeRender() {
    }
    onAfterRender() {
    }
    applyMatrix4(t) {
      this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    applyQuaternion(t) {
      return this.quaternion.premultiply(t), this;
    }
    setRotationFromAxisAngle(t, e) {
      this.quaternion.setFromAxisAngle(t, e);
    }
    setRotationFromEuler(t) {
      this.quaternion.setFromEuler(t, true);
    }
    setRotationFromMatrix(t) {
      this.quaternion.setFromRotationMatrix(t);
    }
    setRotationFromQuaternion(t) {
      this.quaternion.copy(t);
    }
    rotateOnAxis(t, e) {
      return ri.setFromAxisAngle(t, e), this.quaternion.multiply(ri), this;
    }
    rotateOnWorldAxis(t, e) {
      return ri.setFromAxisAngle(t, e), this.quaternion.premultiply(ri), this;
    }
    rotateX(t) {
      return this.rotateOnAxis(Zo, t);
    }
    rotateY(t) {
      return this.rotateOnAxis($o, t);
    }
    rotateZ(t) {
      return this.rotateOnAxis(Jo, t);
    }
    translateOnAxis(t, e) {
      return Ko.copy(t).applyQuaternion(this.quaternion), this.position.add(Ko.multiplyScalar(e)), this;
    }
    translateX(t) {
      return this.translateOnAxis(Zo, t);
    }
    translateY(t) {
      return this.translateOnAxis($o, t);
    }
    translateZ(t) {
      return this.translateOnAxis(Jo, t);
    }
    localToWorld(t) {
      return this.updateWorldMatrix(true, false), t.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(t) {
      return this.updateWorldMatrix(true, false), t.applyMatrix4(ln.copy(this.matrixWorld).invert());
    }
    lookAt(t, e, n) {
      t.isVector3 ? vs.copy(t) : vs.set(t, e, n);
      const s = this.parent;
      this.updateWorldMatrix(true, false), Vi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? ln.lookAt(Vi, vs, this.up) : ln.lookAt(vs, Vi, this.up), this.quaternion.setFromRotationMatrix(ln), s && (ln.extractRotation(s.matrixWorld), ri.setFromRotationMatrix(ln), this.quaternion.premultiply(ri.invert()));
    }
    add(t) {
      if (arguments.length > 1) {
        for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
        return this;
      }
      return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(Qo), ai.child = t, this.dispatchEvent(ai), ai.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
    }
    remove(t) {
      if (arguments.length > 1) {
        for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
        return this;
      }
      const e = this.children.indexOf(t);
      return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Yd), mr.child = t, this.dispatchEvent(mr), mr.child = null), this;
    }
    removeFromParent() {
      const t = this.parent;
      return t !== null && t.remove(this), this;
    }
    clear() {
      return this.remove(...this.children);
    }
    attach(t) {
      return this.updateWorldMatrix(true, false), ln.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(true, false), ln.multiply(t.parent.matrixWorld)), t.applyMatrix4(ln), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(false, true), t.dispatchEvent(Qo), ai.child = t, this.dispatchEvent(ai), ai.child = null, this;
    }
    getObjectById(t) {
      return this.getObjectByProperty("id", t);
    }
    getObjectByName(t) {
      return this.getObjectByProperty("name", t);
    }
    getObjectByProperty(t, e) {
      if (this[t] === e) return this;
      for (let n = 0, s = this.children.length; n < s; n++) {
        const a = this.children[n].getObjectByProperty(t, e);
        if (a !== void 0) return a;
      }
    }
    getObjectsByProperty(t, e, n = []) {
      this[t] === e && n.push(this);
      const s = this.children;
      for (let r = 0, a = s.length; r < a; r++) s[r].getObjectsByProperty(t, e, n);
      return n;
    }
    getWorldPosition(t) {
      return this.updateWorldMatrix(true, false), t.setFromMatrixPosition(this.matrixWorld);
    }
    getWorldQuaternion(t) {
      return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(Vi, t, Xd), t;
    }
    getWorldScale(t) {
      return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(Vi, qd, t), t;
    }
    getWorldDirection(t) {
      this.updateWorldMatrix(true, false);
      const e = this.matrixWorld.elements;
      return t.set(e[8], e[9], e[10]).normalize();
    }
    raycast() {
    }
    traverse(t) {
      t(this);
      const e = this.children;
      for (let n = 0, s = e.length; n < s; n++) e[n].traverse(t);
    }
    traverseVisible(t) {
      if (this.visible === false) return;
      t(this);
      const e = this.children;
      for (let n = 0, s = e.length; n < s; n++) e[n].traverseVisible(t);
    }
    traverseAncestors(t) {
      const e = this.parent;
      e !== null && (t(e), e.traverseAncestors(t));
    }
    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = true;
    }
    updateMatrixWorld(t) {
      this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (this.matrixWorldAutoUpdate === true && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = false, t = true);
      const e = this.children;
      for (let n = 0, s = e.length; n < s; n++) e[n].updateMatrixWorld(t);
    }
    updateWorldMatrix(t, e) {
      const n = this.parent;
      if (t === true && n !== null && n.updateWorldMatrix(true, false), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === true && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), e === true) {
        const s = this.children;
        for (let r = 0, a = s.length; r < a; r++) s[r].updateWorldMatrix(false, true);
      }
    }
    toJSON(t) {
      const e = t === void 0 || typeof t == "string", n = {};
      e && (t = {
        geometries: {},
        materials: {},
        textures: {},
        images: {},
        shapes: {},
        skeletons: {},
        animations: {},
        nodes: {}
      }, n.metadata = {
        version: 4.6,
        type: "Object",
        generator: "Object3D.toJSON"
      });
      const s = {};
      s.uuid = this.uuid, s.type = this.type, this.name !== "" && (s.name = this.name), this.castShadow === true && (s.castShadow = true), this.receiveShadow === true && (s.receiveShadow = true), this.visible === false && (s.visible = false), this.frustumCulled === false && (s.frustumCulled = false), this.renderOrder !== 0 && (s.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (s.userData = this.userData), s.layers = this.layers.mask, s.matrix = this.matrix.toArray(), s.up = this.up.toArray(), this.matrixAutoUpdate === false && (s.matrixAutoUpdate = false), this.isInstancedMesh && (s.type = "InstancedMesh", s.count = this.count, s.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (s.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (s.type = "BatchedMesh", s.perObjectFrustumCulled = this.perObjectFrustumCulled, s.sortObjects = this.sortObjects, s.drawRanges = this._drawRanges, s.reservedRanges = this._reservedRanges, s.visibility = this._visibility, s.active = this._active, s.bounds = this._bounds.map((o) => ({
        boxInitialized: o.boxInitialized,
        boxMin: o.box.min.toArray(),
        boxMax: o.box.max.toArray(),
        sphereInitialized: o.sphereInitialized,
        sphereRadius: o.sphere.radius,
        sphereCenter: o.sphere.center.toArray()
      })), s.maxInstanceCount = this._maxInstanceCount, s.maxVertexCount = this._maxVertexCount, s.maxIndexCount = this._maxIndexCount, s.geometryInitialized = this._geometryInitialized, s.geometryCount = this._geometryCount, s.matricesTexture = this._matricesTexture.toJSON(t), this._colorsTexture !== null && (s.colorsTexture = this._colorsTexture.toJSON(t)), this.boundingSphere !== null && (s.boundingSphere = {
        center: s.boundingSphere.center.toArray(),
        radius: s.boundingSphere.radius
      }), this.boundingBox !== null && (s.boundingBox = {
        min: s.boundingBox.min.toArray(),
        max: s.boundingBox.max.toArray()
      }));
      function r(o, l) {
        return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(t)), l.uuid;
      }
      if (this.isScene) this.background && (this.background.isColor ? s.background = this.background.toJSON() : this.background.isTexture && (s.background = this.background.toJSON(t).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== true && (s.environment = this.environment.toJSON(t).uuid);
      else if (this.isMesh || this.isLine || this.isPoints) {
        s.geometry = r(t.geometries, this.geometry);
        const o = this.geometry.parameters;
        if (o !== void 0 && o.shapes !== void 0) {
          const l = o.shapes;
          if (Array.isArray(l)) for (let c = 0, h = l.length; c < h; c++) {
            const d = l[c];
            r(t.shapes, d);
          }
          else r(t.shapes, l);
        }
      }
      if (this.isSkinnedMesh && (s.bindMode = this.bindMode, s.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(t.skeletons, this.skeleton), s.skeleton = this.skeleton.uuid)), this.material !== void 0) if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++) o.push(r(t.materials, this.material[l]));
        s.material = o;
      } else s.material = r(t.materials, this.material);
      if (this.children.length > 0) {
        s.children = [];
        for (let o = 0; o < this.children.length; o++) s.children.push(this.children[o].toJSON(t).object);
      }
      if (this.animations.length > 0) {
        s.animations = [];
        for (let o = 0; o < this.animations.length; o++) {
          const l = this.animations[o];
          s.animations.push(r(t.animations, l));
        }
      }
      if (e) {
        const o = a(t.geometries), l = a(t.materials), c = a(t.textures), h = a(t.images), d = a(t.shapes), f = a(t.skeletons), p = a(t.animations), g = a(t.nodes);
        o.length > 0 && (n.geometries = o), l.length > 0 && (n.materials = l), c.length > 0 && (n.textures = c), h.length > 0 && (n.images = h), d.length > 0 && (n.shapes = d), f.length > 0 && (n.skeletons = f), p.length > 0 && (n.animations = p), g.length > 0 && (n.nodes = g);
      }
      return n.object = s, n;
      function a(o) {
        const l = [];
        for (const c in o) {
          const h = o[c];
          delete h.metadata, l.push(h);
        }
        return l;
      }
    }
    clone(t) {
      return new this.constructor().copy(this, t);
    }
    copy(t, e = true) {
      if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, this.animations = t.animations.slice(), this.userData = JSON.parse(JSON.stringify(t.userData)), e === true) for (let n = 0; n < t.children.length; n++) {
        const s = t.children[n];
        this.add(s.clone());
      }
      return this;
    }
  }
  ve.DEFAULT_UP = new R(0, 1, 0);
  ve.DEFAULT_MATRIX_AUTO_UPDATE = true;
  ve.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
  const Xe = new R(), cn = new R(), gr = new R(), hn = new R(), oi = new R(), li = new R(), tl = new R(), _r = new R(), vr = new R(), xr = new R(), Mr = new Jt(), Sr = new Jt(), yr = new Jt();
  class Ye {
    constructor(t = new R(), e = new R(), n = new R()) {
      this.a = t, this.b = e, this.c = n;
    }
    static getNormal(t, e, n, s) {
      s.subVectors(n, e), Xe.subVectors(t, e), s.cross(Xe);
      const r = s.lengthSq();
      return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0);
    }
    static getBarycoord(t, e, n, s, r) {
      Xe.subVectors(s, e), cn.subVectors(n, e), gr.subVectors(t, e);
      const a = Xe.dot(Xe), o = Xe.dot(cn), l = Xe.dot(gr), c = cn.dot(cn), h = cn.dot(gr), d = a * c - o * o;
      if (d === 0) return r.set(0, 0, 0), null;
      const f = 1 / d, p = (c * l - o * h) * f, g = (a * h - o * l) * f;
      return r.set(1 - p - g, g, p);
    }
    static containsPoint(t, e, n, s) {
      return this.getBarycoord(t, e, n, s, hn) === null ? false : hn.x >= 0 && hn.y >= 0 && hn.x + hn.y <= 1;
    }
    static getInterpolation(t, e, n, s, r, a, o, l) {
      return this.getBarycoord(t, e, n, s, hn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, hn.x), l.addScaledVector(a, hn.y), l.addScaledVector(o, hn.z), l);
    }
    static getInterpolatedAttribute(t, e, n, s, r, a) {
      return Mr.setScalar(0), Sr.setScalar(0), yr.setScalar(0), Mr.fromBufferAttribute(t, e), Sr.fromBufferAttribute(t, n), yr.fromBufferAttribute(t, s), a.setScalar(0), a.addScaledVector(Mr, r.x), a.addScaledVector(Sr, r.y), a.addScaledVector(yr, r.z), a;
    }
    static isFrontFacing(t, e, n, s) {
      return Xe.subVectors(n, e), cn.subVectors(t, e), Xe.cross(cn).dot(s) < 0;
    }
    set(t, e, n) {
      return this.a.copy(t), this.b.copy(e), this.c.copy(n), this;
    }
    setFromPointsAndIndices(t, e, n, s) {
      return this.a.copy(t[e]), this.b.copy(t[n]), this.c.copy(t[s]), this;
    }
    setFromAttributeAndIndices(t, e, n, s) {
      return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, n), this.c.fromBufferAttribute(t, s), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
    }
    getArea() {
      return Xe.subVectors(this.c, this.b), cn.subVectors(this.a, this.b), Xe.cross(cn).length() * 0.5;
    }
    getMidpoint(t) {
      return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    getNormal(t) {
      return Ye.getNormal(this.a, this.b, this.c, t);
    }
    getPlane(t) {
      return t.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(t, e) {
      return Ye.getBarycoord(t, this.a, this.b, this.c, e);
    }
    getInterpolation(t, e, n, s, r) {
      return Ye.getInterpolation(t, this.a, this.b, this.c, e, n, s, r);
    }
    containsPoint(t) {
      return Ye.containsPoint(t, this.a, this.b, this.c);
    }
    isFrontFacing(t) {
      return Ye.isFrontFacing(this.a, this.b, this.c, t);
    }
    intersectsBox(t) {
      return t.intersectsTriangle(this);
    }
    closestPointToPoint(t, e) {
      const n = this.a, s = this.b, r = this.c;
      let a, o;
      oi.subVectors(s, n), li.subVectors(r, n), _r.subVectors(t, n);
      const l = oi.dot(_r), c = li.dot(_r);
      if (l <= 0 && c <= 0) return e.copy(n);
      vr.subVectors(t, s);
      const h = oi.dot(vr), d = li.dot(vr);
      if (h >= 0 && d <= h) return e.copy(s);
      const f = l * d - h * c;
      if (f <= 0 && l >= 0 && h <= 0) return a = l / (l - h), e.copy(n).addScaledVector(oi, a);
      xr.subVectors(t, r);
      const p = oi.dot(xr), g = li.dot(xr);
      if (g >= 0 && p <= g) return e.copy(r);
      const v = p * c - l * g;
      if (v <= 0 && c >= 0 && g <= 0) return o = c / (c - g), e.copy(n).addScaledVector(li, o);
      const m = h * g - p * d;
      if (m <= 0 && d - h >= 0 && p - g >= 0) return tl.subVectors(r, s), o = (d - h) / (d - h + (p - g)), e.copy(s).addScaledVector(tl, o);
      const u = 1 / (m + v + f);
      return a = v * u, o = f * u, e.copy(n).addScaledVector(oi, a).addScaledVector(li, o);
    }
    equals(t) {
      return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
    }
  }
  const Vc = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  }, En = {
    h: 0,
    s: 0,
    l: 0
  }, xs = {
    h: 0,
    s: 0,
    l: 0
  };
  function Er(i, t, e) {
    return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i;
  }
  class Pt {
    constructor(t, e, n) {
      return this.isColor = true, this.r = 1, this.g = 1, this.b = 1, this.set(t, e, n);
    }
    set(t, e, n) {
      if (e === void 0 && n === void 0) {
        const s = t;
        s && s.isColor ? this.copy(s) : typeof s == "number" ? this.setHex(s) : typeof s == "string" && this.setStyle(s);
      } else this.setRGB(t, e, n);
      return this;
    }
    setScalar(t) {
      return this.r = t, this.g = t, this.b = t, this;
    }
    setHex(t, e = Fe) {
      return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, Gt.toWorkingColorSpace(this, e), this;
    }
    setRGB(t, e, n, s = Gt.workingColorSpace) {
      return this.r = t, this.g = e, this.b = n, Gt.toWorkingColorSpace(this, s), this;
    }
    setHSL(t, e, n, s = Gt.workingColorSpace) {
      if (t = qa(t, 1), e = Ee(e, 0, 1), n = Ee(n, 0, 1), e === 0) this.r = this.g = this.b = n;
      else {
        const r = n <= 0.5 ? n * (1 + e) : n + e - n * e, a = 2 * n - r;
        this.r = Er(a, r, t + 1 / 3), this.g = Er(a, r, t), this.b = Er(a, r, t - 1 / 3);
      }
      return Gt.toWorkingColorSpace(this, s), this;
    }
    setStyle(t, e = Fe) {
      function n(r) {
        r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + t + " will be ignored.");
      }
      let s;
      if (s = /^(\w+)\(([^\)]*)\)/.exec(t)) {
        let r;
        const a = s[1], o = s[2];
        switch (a) {
          case "rgb":
          case "rgba":
            if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, e);
            if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(r[4]), this.setRGB(Math.min(100, parseInt(r[1], 10)) / 100, Math.min(100, parseInt(r[2], 10)) / 100, Math.min(100, parseInt(r[3], 10)) / 100, e);
            break;
          case "hsl":
          case "hsla":
            if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o)) return n(r[4]), this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, e);
            break;
          default:
            console.warn("THREE.Color: Unknown color model " + t);
        }
      } else if (s = /^\#([A-Fa-f\d]+)$/.exec(t)) {
        const r = s[1], a = r.length;
        if (a === 3) return this.setRGB(parseInt(r.charAt(0), 16) / 15, parseInt(r.charAt(1), 16) / 15, parseInt(r.charAt(2), 16) / 15, e);
        if (a === 6) return this.setHex(parseInt(r, 16), e);
        console.warn("THREE.Color: Invalid hex color " + t);
      } else if (t && t.length > 0) return this.setColorName(t, e);
      return this;
    }
    setColorName(t, e = Fe) {
      const n = Vc[t.toLowerCase()];
      return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this;
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(t) {
      return this.r = t.r, this.g = t.g, this.b = t.b, this;
    }
    copySRGBToLinear(t) {
      return this.r = mn(t.r), this.g = mn(t.g), this.b = mn(t.b), this;
    }
    copyLinearToSRGB(t) {
      return this.r = Ei(t.r), this.g = Ei(t.g), this.b = Ei(t.b), this;
    }
    convertSRGBToLinear() {
      return this.copySRGBToLinear(this), this;
    }
    convertLinearToSRGB() {
      return this.copyLinearToSRGB(this), this;
    }
    getHex(t = Fe) {
      return Gt.fromWorkingColorSpace(ye.copy(this), t), Math.round(Ee(ye.r * 255, 0, 255)) * 65536 + Math.round(Ee(ye.g * 255, 0, 255)) * 256 + Math.round(Ee(ye.b * 255, 0, 255));
    }
    getHexString(t = Fe) {
      return ("000000" + this.getHex(t).toString(16)).slice(-6);
    }
    getHSL(t, e = Gt.workingColorSpace) {
      Gt.fromWorkingColorSpace(ye.copy(this), e);
      const n = ye.r, s = ye.g, r = ye.b, a = Math.max(n, s, r), o = Math.min(n, s, r);
      let l, c;
      const h = (o + a) / 2;
      if (o === a) l = 0, c = 0;
      else {
        const d = a - o;
        switch (c = h <= 0.5 ? d / (a + o) : d / (2 - a - o), a) {
          case n:
            l = (s - r) / d + (s < r ? 6 : 0);
            break;
          case s:
            l = (r - n) / d + 2;
            break;
          case r:
            l = (n - s) / d + 4;
            break;
        }
        l /= 6;
      }
      return t.h = l, t.s = c, t.l = h, t;
    }
    getRGB(t, e = Gt.workingColorSpace) {
      return Gt.fromWorkingColorSpace(ye.copy(this), e), t.r = ye.r, t.g = ye.g, t.b = ye.b, t;
    }
    getStyle(t = Fe) {
      Gt.fromWorkingColorSpace(ye.copy(this), t);
      const e = ye.r, n = ye.g, s = ye.b;
      return t !== Fe ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(s * 255)})`;
    }
    offsetHSL(t, e, n) {
      return this.getHSL(En), this.setHSL(En.h + t, En.s + e, En.l + n);
    }
    add(t) {
      return this.r += t.r, this.g += t.g, this.b += t.b, this;
    }
    addColors(t, e) {
      return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this;
    }
    addScalar(t) {
      return this.r += t, this.g += t, this.b += t, this;
    }
    sub(t) {
      return this.r = Math.max(0, this.r - t.r), this.g = Math.max(0, this.g - t.g), this.b = Math.max(0, this.b - t.b), this;
    }
    multiply(t) {
      return this.r *= t.r, this.g *= t.g, this.b *= t.b, this;
    }
    multiplyScalar(t) {
      return this.r *= t, this.g *= t, this.b *= t, this;
    }
    lerp(t, e) {
      return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, this;
    }
    lerpColors(t, e, n) {
      return this.r = t.r + (e.r - t.r) * n, this.g = t.g + (e.g - t.g) * n, this.b = t.b + (e.b - t.b) * n, this;
    }
    lerpHSL(t, e) {
      this.getHSL(En), t.getHSL(xs);
      const n = Qi(En.h, xs.h, e), s = Qi(En.s, xs.s, e), r = Qi(En.l, xs.l, e);
      return this.setHSL(n, s, r), this;
    }
    setFromVector3(t) {
      return this.r = t.x, this.g = t.y, this.b = t.z, this;
    }
    applyMatrix3(t) {
      const e = this.r, n = this.g, s = this.b, r = t.elements;
      return this.r = r[0] * e + r[3] * n + r[6] * s, this.g = r[1] * e + r[4] * n + r[7] * s, this.b = r[2] * e + r[5] * n + r[8] * s, this;
    }
    equals(t) {
      return t.r === this.r && t.g === this.g && t.b === this.b;
    }
    fromArray(t, e = 0) {
      return this.r = t[e], this.g = t[e + 1], this.b = t[e + 2], this;
    }
    toArray(t = [], e = 0) {
      return t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t;
    }
    fromBufferAttribute(t, e) {
      return this.r = t.getX(e), this.g = t.getY(e), this.b = t.getZ(e), this;
    }
    toJSON() {
      return this.getHex();
    }
    *[Symbol.iterator]() {
      yield this.r, yield this.g, yield this.b;
    }
  }
  const ye = new Pt();
  Pt.NAMES = Vc;
  let jd = 0;
  class $n extends jn {
    static get type() {
      return "Material";
    }
    get type() {
      return this.constructor.type;
    }
    set type(t) {
    }
    constructor() {
      super(), this.isMaterial = true, Object.defineProperty(this, "id", {
        value: jd++
      }), this.uuid = Li(), this.name = "", this.blending = Si, this.side = Pn, this.vertexColors = false, this.opacity = 1, this.transparent = false, this.alphaHash = false, this.blendSrc = Wr, this.blendDst = Xr, this.blendEquation = zn, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Pt(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ti, this.depthTest = true, this.depthWrite = true, this.stencilWriteMask = 255, this.stencilFunc = Fo, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Qn, this.stencilZFail = Qn, this.stencilZPass = Qn, this.stencilWrite = false, this.clippingPlanes = null, this.clipIntersection = false, this.clipShadows = false, this.shadowSide = null, this.colorWrite = true, this.precision = null, this.polygonOffset = false, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = false, this.alphaToCoverage = false, this.premultipliedAlpha = false, this.forceSinglePass = false, this.visible = true, this.toneMapped = true, this.userData = {}, this.version = 0, this._alphaTest = 0;
    }
    get alphaTest() {
      return this._alphaTest;
    }
    set alphaTest(t) {
      this._alphaTest > 0 != t > 0 && this.version++, this._alphaTest = t;
    }
    onBeforeRender() {
    }
    onBeforeCompile() {
    }
    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }
    setValues(t) {
      if (t !== void 0) for (const e in t) {
        const n = t[e];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);
          continue;
        }
        const s = this[e];
        if (s === void 0) {
          console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);
          continue;
        }
        s && s.isColor ? s.set(n) : s && s.isVector3 && n && n.isVector3 ? s.copy(n) : this[e] = n;
      }
    }
    toJSON(t) {
      const e = t === void 0 || typeof t == "string";
      e && (t = {
        textures: {},
        images: {}
      });
      const n = {
        metadata: {
          version: 4.6,
          type: "Material",
          generator: "Material.toJSON"
        }
      };
      n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== Si && (n.blending = this.blending), this.side !== Pn && (n.side = this.side), this.vertexColors === true && (n.vertexColors = true), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === true && (n.transparent = true), this.blendSrc !== Wr && (n.blendSrc = this.blendSrc), this.blendDst !== Xr && (n.blendDst = this.blendDst), this.blendEquation !== zn && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ti && (n.depthFunc = this.depthFunc), this.depthTest === false && (n.depthTest = this.depthTest), this.depthWrite === false && (n.depthWrite = this.depthWrite), this.colorWrite === false && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Fo && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Qn && (n.stencilFail = this.stencilFail), this.stencilZFail !== Qn && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== Qn && (n.stencilZPass = this.stencilZPass), this.stencilWrite === true && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === true && (n.polygonOffset = true), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === true && (n.dithering = true), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === true && (n.alphaHash = true), this.alphaToCoverage === true && (n.alphaToCoverage = true), this.premultipliedAlpha === true && (n.premultipliedAlpha = true), this.forceSinglePass === true && (n.forceSinglePass = true), this.wireframe === true && (n.wireframe = true), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === true && (n.flatShading = true), this.visible === false && (n.visible = false), this.toneMapped === false && (n.toneMapped = false), this.fog === false && (n.fog = false), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
      function s(r) {
        const a = [];
        for (const o in r) {
          const l = r[o];
          delete l.metadata, a.push(l);
        }
        return a;
      }
      if (e) {
        const r = s(t.textures), a = s(t.images);
        r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a);
      }
      return n;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      this.name = t.name, this.blending = t.blending, this.side = t.side, this.vertexColors = t.vertexColors, this.opacity = t.opacity, this.transparent = t.transparent, this.blendSrc = t.blendSrc, this.blendDst = t.blendDst, this.blendEquation = t.blendEquation, this.blendSrcAlpha = t.blendSrcAlpha, this.blendDstAlpha = t.blendDstAlpha, this.blendEquationAlpha = t.blendEquationAlpha, this.blendColor.copy(t.blendColor), this.blendAlpha = t.blendAlpha, this.depthFunc = t.depthFunc, this.depthTest = t.depthTest, this.depthWrite = t.depthWrite, this.stencilWriteMask = t.stencilWriteMask, this.stencilFunc = t.stencilFunc, this.stencilRef = t.stencilRef, this.stencilFuncMask = t.stencilFuncMask, this.stencilFail = t.stencilFail, this.stencilZFail = t.stencilZFail, this.stencilZPass = t.stencilZPass, this.stencilWrite = t.stencilWrite;
      const e = t.clippingPlanes;
      let n = null;
      if (e !== null) {
        const s = e.length;
        n = new Array(s);
        for (let r = 0; r !== s; ++r) n[r] = e[r].clone();
      }
      return this.clippingPlanes = n, this.clipIntersection = t.clipIntersection, this.clipShadows = t.clipShadows, this.shadowSide = t.shadowSide, this.colorWrite = t.colorWrite, this.precision = t.precision, this.polygonOffset = t.polygonOffset, this.polygonOffsetFactor = t.polygonOffsetFactor, this.polygonOffsetUnits = t.polygonOffsetUnits, this.dithering = t.dithering, this.alphaTest = t.alphaTest, this.alphaHash = t.alphaHash, this.alphaToCoverage = t.alphaToCoverage, this.premultipliedAlpha = t.premultipliedAlpha, this.forceSinglePass = t.forceSinglePass, this.visible = t.visible, this.toneMapped = t.toneMapped, this.userData = JSON.parse(JSON.stringify(t.userData)), this;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
    set needsUpdate(t) {
      t === true && this.version++;
    }
    onBuild() {
      console.warn("Material: onBuild() has been removed.");
    }
  }
  class ss extends $n {
    static get type() {
      return "MeshBasicMaterial";
    }
    constructor(t) {
      super(), this.isMeshBasicMaterial = true, this.color = new Pt(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new nn(), this.combine = Sc, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
    }
  }
  const ce = new R(), Ms = new _t();
  class xe {
    constructor(t, e, n = false) {
      if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
      this.isBufferAttribute = true, this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = Oo, this.updateRanges = [], this.gpuType = tn, this.version = 0;
    }
    onUploadCallback() {
    }
    set needsUpdate(t) {
      t === true && this.version++;
    }
    setUsage(t) {
      return this.usage = t, this;
    }
    addUpdateRange(t, e) {
      this.updateRanges.push({
        start: t,
        count: e
      });
    }
    clearUpdateRanges() {
      this.updateRanges.length = 0;
    }
    copy(t) {
      return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this.gpuType = t.gpuType, this;
    }
    copyAt(t, e, n) {
      t *= this.itemSize, n *= e.itemSize;
      for (let s = 0, r = this.itemSize; s < r; s++) this.array[t + s] = e.array[n + s];
      return this;
    }
    copyArray(t) {
      return this.array.set(t), this;
    }
    applyMatrix3(t) {
      if (this.itemSize === 2) for (let e = 0, n = this.count; e < n; e++) Ms.fromBufferAttribute(this, e), Ms.applyMatrix3(t), this.setXY(e, Ms.x, Ms.y);
      else if (this.itemSize === 3) for (let e = 0, n = this.count; e < n; e++) ce.fromBufferAttribute(this, e), ce.applyMatrix3(t), this.setXYZ(e, ce.x, ce.y, ce.z);
      return this;
    }
    applyMatrix4(t) {
      for (let e = 0, n = this.count; e < n; e++) ce.fromBufferAttribute(this, e), ce.applyMatrix4(t), this.setXYZ(e, ce.x, ce.y, ce.z);
      return this;
    }
    applyNormalMatrix(t) {
      for (let e = 0, n = this.count; e < n; e++) ce.fromBufferAttribute(this, e), ce.applyNormalMatrix(t), this.setXYZ(e, ce.x, ce.y, ce.z);
      return this;
    }
    transformDirection(t) {
      for (let e = 0, n = this.count; e < n; e++) ce.fromBufferAttribute(this, e), ce.transformDirection(t), this.setXYZ(e, ce.x, ce.y, ce.z);
      return this;
    }
    set(t, e = 0) {
      return this.array.set(t, e), this;
    }
    getComponent(t, e) {
      let n = this.array[t * this.itemSize + e];
      return this.normalized && (n = mi(n, this.array)), n;
    }
    setComponent(t, e, n) {
      return this.normalized && (n = Te(n, this.array)), this.array[t * this.itemSize + e] = n, this;
    }
    getX(t) {
      let e = this.array[t * this.itemSize];
      return this.normalized && (e = mi(e, this.array)), e;
    }
    setX(t, e) {
      return this.normalized && (e = Te(e, this.array)), this.array[t * this.itemSize] = e, this;
    }
    getY(t) {
      let e = this.array[t * this.itemSize + 1];
      return this.normalized && (e = mi(e, this.array)), e;
    }
    setY(t, e) {
      return this.normalized && (e = Te(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
    }
    getZ(t) {
      let e = this.array[t * this.itemSize + 2];
      return this.normalized && (e = mi(e, this.array)), e;
    }
    setZ(t, e) {
      return this.normalized && (e = Te(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
    }
    getW(t) {
      let e = this.array[t * this.itemSize + 3];
      return this.normalized && (e = mi(e, this.array)), e;
    }
    setW(t, e) {
      return this.normalized && (e = Te(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
    }
    setXY(t, e, n) {
      return t *= this.itemSize, this.normalized && (e = Te(e, this.array), n = Te(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
    }
    setXYZ(t, e, n, s) {
      return t *= this.itemSize, this.normalized && (e = Te(e, this.array), n = Te(n, this.array), s = Te(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this;
    }
    setXYZW(t, e, n, s, r) {
      return t *= this.itemSize, this.normalized && (e = Te(e, this.array), n = Te(n, this.array), s = Te(s, this.array), r = Te(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this.array[t + 3] = r, this;
    }
    onUpload(t) {
      return this.onUploadCallback = t, this;
    }
    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
      const t = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized
      };
      return this.name !== "" && (t.name = this.name), this.usage !== Oo && (t.usage = this.usage), t;
    }
  }
  class Wc extends xe {
    constructor(t, e, n) {
      super(new Uint16Array(t), e, n);
    }
  }
  class Xc extends xe {
    constructor(t, e, n) {
      super(new Uint32Array(t), e, n);
    }
  }
  class fe extends xe {
    constructor(t, e, n) {
      super(new Float32Array(t), e, n);
    }
  }
  let Kd = 0;
  const ke = new Zt(), br = new ve(), ci = new R(), Ne = new Kn(), Wi = new Kn(), ge = new R();
  class be extends jn {
    constructor() {
      super(), this.isBufferGeometry = true, Object.defineProperty(this, "id", {
        value: Kd++
      }), this.uuid = Li(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = false, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
        start: 0,
        count: 1 / 0
      }, this.userData = {};
    }
    getIndex() {
      return this.index;
    }
    setIndex(t) {
      return Array.isArray(t) ? this.index = new (kc(t) ? Xc : Wc)(t, 1) : this.index = t, this;
    }
    setIndirect(t) {
      return this.indirect = t, this;
    }
    getIndirect() {
      return this.indirect;
    }
    getAttribute(t) {
      return this.attributes[t];
    }
    setAttribute(t, e) {
      return this.attributes[t] = e, this;
    }
    deleteAttribute(t) {
      return delete this.attributes[t], this;
    }
    hasAttribute(t) {
      return this.attributes[t] !== void 0;
    }
    addGroup(t, e, n = 0) {
      this.groups.push({
        start: t,
        count: e,
        materialIndex: n
      });
    }
    clearGroups() {
      this.groups = [];
    }
    setDrawRange(t, e) {
      this.drawRange.start = t, this.drawRange.count = e;
    }
    applyMatrix4(t) {
      const e = this.attributes.position;
      e !== void 0 && (e.applyMatrix4(t), e.needsUpdate = true);
      const n = this.attributes.normal;
      if (n !== void 0) {
        const r = new Ut().getNormalMatrix(t);
        n.applyNormalMatrix(r), n.needsUpdate = true;
      }
      const s = this.attributes.tangent;
      return s !== void 0 && (s.transformDirection(t), s.needsUpdate = true), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
    }
    applyQuaternion(t) {
      return ke.makeRotationFromQuaternion(t), this.applyMatrix4(ke), this;
    }
    rotateX(t) {
      return ke.makeRotationX(t), this.applyMatrix4(ke), this;
    }
    rotateY(t) {
      return ke.makeRotationY(t), this.applyMatrix4(ke), this;
    }
    rotateZ(t) {
      return ke.makeRotationZ(t), this.applyMatrix4(ke), this;
    }
    translate(t, e, n) {
      return ke.makeTranslation(t, e, n), this.applyMatrix4(ke), this;
    }
    scale(t, e, n) {
      return ke.makeScale(t, e, n), this.applyMatrix4(ke), this;
    }
    lookAt(t) {
      return br.lookAt(t), br.updateMatrix(), this.applyMatrix4(br.matrix), this;
    }
    center() {
      return this.computeBoundingBox(), this.boundingBox.getCenter(ci).negate(), this.translate(ci.x, ci.y, ci.z), this;
    }
    setFromPoints(t) {
      const e = this.getAttribute("position");
      if (e === void 0) {
        const n = [];
        for (let s = 0, r = t.length; s < r; s++) {
          const a = t[s];
          n.push(a.x, a.y, a.z || 0);
        }
        this.setAttribute("position", new fe(n, 3));
      } else {
        for (let n = 0, s = e.count; n < s; n++) {
          const r = t[n];
          e.setXYZ(n, r.x, r.y, r.z || 0);
        }
        t.length > e.count && console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."), e.needsUpdate = true;
      }
      return this;
    }
    computeBoundingBox() {
      this.boundingBox === null && (this.boundingBox = new Kn());
      const t = this.attributes.position, e = this.morphAttributes.position;
      if (t && t.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new R(-1 / 0, -1 / 0, -1 / 0), new R(1 / 0, 1 / 0, 1 / 0));
        return;
      }
      if (t !== void 0) {
        if (this.boundingBox.setFromBufferAttribute(t), e) for (let n = 0, s = e.length; n < s; n++) {
          const r = e[n];
          Ne.setFromBufferAttribute(r), this.morphTargetsRelative ? (ge.addVectors(this.boundingBox.min, Ne.min), this.boundingBox.expandByPoint(ge), ge.addVectors(this.boundingBox.max, Ne.max), this.boundingBox.expandByPoint(ge)) : (this.boundingBox.expandByPoint(Ne.min), this.boundingBox.expandByPoint(Ne.max));
        }
      } else this.boundingBox.makeEmpty();
      (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
    computeBoundingSphere() {
      this.boundingSphere === null && (this.boundingSphere = new Zn());
      const t = this.attributes.position, e = this.morphAttributes.position;
      if (t && t.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new R(), 1 / 0);
        return;
      }
      if (t) {
        const n = this.boundingSphere.center;
        if (Ne.setFromBufferAttribute(t), e) for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r];
          Wi.setFromBufferAttribute(o), this.morphTargetsRelative ? (ge.addVectors(Ne.min, Wi.min), Ne.expandByPoint(ge), ge.addVectors(Ne.max, Wi.max), Ne.expandByPoint(ge)) : (Ne.expandByPoint(Wi.min), Ne.expandByPoint(Wi.max));
        }
        Ne.getCenter(n);
        let s = 0;
        for (let r = 0, a = t.count; r < a; r++) ge.fromBufferAttribute(t, r), s = Math.max(s, n.distanceToSquared(ge));
        if (e) for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r], l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++) ge.fromBufferAttribute(o, c), l && (ci.fromBufferAttribute(t, c), ge.add(ci)), s = Math.max(s, n.distanceToSquared(ge));
        }
        this.boundingSphere.radius = Math.sqrt(s), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
      }
    }
    computeTangents() {
      const t = this.index, e = this.attributes;
      if (t === null || e.position === void 0 || e.normal === void 0 || e.uv === void 0) {
        console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
        return;
      }
      const n = e.position, s = e.normal, r = e.uv;
      this.hasAttribute("tangent") === false && this.setAttribute("tangent", new xe(new Float32Array(4 * n.count), 4));
      const a = this.getAttribute("tangent"), o = [], l = [];
      for (let P = 0; P < n.count; P++) o[P] = new R(), l[P] = new R();
      const c = new R(), h = new R(), d = new R(), f = new _t(), p = new _t(), g = new _t(), v = new R(), m = new R();
      function u(P, y, x) {
        c.fromBufferAttribute(n, P), h.fromBufferAttribute(n, y), d.fromBufferAttribute(n, x), f.fromBufferAttribute(r, P), p.fromBufferAttribute(r, y), g.fromBufferAttribute(r, x), h.sub(c), d.sub(c), p.sub(f), g.sub(f);
        const C = 1 / (p.x * g.y - g.x * p.y);
        isFinite(C) && (v.copy(h).multiplyScalar(g.y).addScaledVector(d, -p.y).multiplyScalar(C), m.copy(d).multiplyScalar(p.x).addScaledVector(h, -g.x).multiplyScalar(C), o[P].add(v), o[y].add(v), o[x].add(v), l[P].add(m), l[y].add(m), l[x].add(m));
      }
      let b = this.groups;
      b.length === 0 && (b = [
        {
          start: 0,
          count: t.count
        }
      ]);
      for (let P = 0, y = b.length; P < y; ++P) {
        const x = b[P], C = x.start, k = x.count;
        for (let z = C, V = C + k; z < V; z += 3) u(t.getX(z + 0), t.getX(z + 1), t.getX(z + 2));
      }
      const E = new R(), S = new R(), N = new R(), A = new R();
      function w(P) {
        N.fromBufferAttribute(s, P), A.copy(N);
        const y = o[P];
        E.copy(y), E.sub(N.multiplyScalar(N.dot(y))).normalize(), S.crossVectors(A, y);
        const C = S.dot(l[P]) < 0 ? -1 : 1;
        a.setXYZW(P, E.x, E.y, E.z, C);
      }
      for (let P = 0, y = b.length; P < y; ++P) {
        const x = b[P], C = x.start, k = x.count;
        for (let z = C, V = C + k; z < V; z += 3) w(t.getX(z + 0)), w(t.getX(z + 1)), w(t.getX(z + 2));
      }
    }
    computeVertexNormals() {
      const t = this.index, e = this.getAttribute("position");
      if (e !== void 0) {
        let n = this.getAttribute("normal");
        if (n === void 0) n = new xe(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
        else for (let f = 0, p = n.count; f < p; f++) n.setXYZ(f, 0, 0, 0);
        const s = new R(), r = new R(), a = new R(), o = new R(), l = new R(), c = new R(), h = new R(), d = new R();
        if (t) for (let f = 0, p = t.count; f < p; f += 3) {
          const g = t.getX(f + 0), v = t.getX(f + 1), m = t.getX(f + 2);
          s.fromBufferAttribute(e, g), r.fromBufferAttribute(e, v), a.fromBufferAttribute(e, m), h.subVectors(a, r), d.subVectors(s, r), h.cross(d), o.fromBufferAttribute(n, g), l.fromBufferAttribute(n, v), c.fromBufferAttribute(n, m), o.add(h), l.add(h), c.add(h), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(v, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z);
        }
        else for (let f = 0, p = e.count; f < p; f += 3) s.fromBufferAttribute(e, f + 0), r.fromBufferAttribute(e, f + 1), a.fromBufferAttribute(e, f + 2), h.subVectors(a, r), d.subVectors(s, r), h.cross(d), n.setXYZ(f + 0, h.x, h.y, h.z), n.setXYZ(f + 1, h.x, h.y, h.z), n.setXYZ(f + 2, h.x, h.y, h.z);
        this.normalizeNormals(), n.needsUpdate = true;
      }
    }
    normalizeNormals() {
      const t = this.attributes.normal;
      for (let e = 0, n = t.count; e < n; e++) ge.fromBufferAttribute(t, e), ge.normalize(), t.setXYZ(e, ge.x, ge.y, ge.z);
    }
    toNonIndexed() {
      function t(o, l) {
        const c = o.array, h = o.itemSize, d = o.normalized, f = new c.constructor(l.length * h);
        let p = 0, g = 0;
        for (let v = 0, m = l.length; v < m; v++) {
          o.isInterleavedBufferAttribute ? p = l[v] * o.data.stride + o.offset : p = l[v] * h;
          for (let u = 0; u < h; u++) f[g++] = c[p++];
        }
        return new xe(f, h, d);
      }
      if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
      const e = new be(), n = this.index.array, s = this.attributes;
      for (const o in s) {
        const l = s[o], c = t(l, n);
        e.setAttribute(o, c);
      }
      const r = this.morphAttributes;
      for (const o in r) {
        const l = [], c = r[o];
        for (let h = 0, d = c.length; h < d; h++) {
          const f = c[h], p = t(f, n);
          l.push(p);
        }
        e.morphAttributes[o] = l;
      }
      e.morphTargetsRelative = this.morphTargetsRelative;
      const a = this.groups;
      for (let o = 0, l = a.length; o < l; o++) {
        const c = a[o];
        e.addGroup(c.start, c.count, c.materialIndex);
      }
      return e;
    }
    toJSON() {
      const t = {
        metadata: {
          version: 4.6,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON"
        }
      };
      if (t.uuid = this.uuid, t.type = this.type, this.name !== "" && (t.name = this.name), Object.keys(this.userData).length > 0 && (t.userData = this.userData), this.parameters !== void 0) {
        const l = this.parameters;
        for (const c in l) l[c] !== void 0 && (t[c] = l[c]);
        return t;
      }
      t.data = {
        attributes: {}
      };
      const e = this.index;
      e !== null && (t.data.index = {
        type: e.array.constructor.name,
        array: Array.prototype.slice.call(e.array)
      });
      const n = this.attributes;
      for (const l in n) {
        const c = n[l];
        t.data.attributes[l] = c.toJSON(t.data);
      }
      const s = {};
      let r = false;
      for (const l in this.morphAttributes) {
        const c = this.morphAttributes[l], h = [];
        for (let d = 0, f = c.length; d < f; d++) {
          const p = c[d];
          h.push(p.toJSON(t.data));
        }
        h.length > 0 && (s[l] = h, r = true);
      }
      r && (t.data.morphAttributes = s, t.data.morphTargetsRelative = this.morphTargetsRelative);
      const a = this.groups;
      a.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(a)));
      const o = this.boundingSphere;
      return o !== null && (t.data.boundingSphere = {
        center: o.center.toArray(),
        radius: o.radius
      }), t;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    copy(t) {
      this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
      const e = {};
      this.name = t.name;
      const n = t.index;
      n !== null && this.setIndex(n.clone(e));
      const s = t.attributes;
      for (const c in s) {
        const h = s[c];
        this.setAttribute(c, h.clone(e));
      }
      const r = t.morphAttributes;
      for (const c in r) {
        const h = [], d = r[c];
        for (let f = 0, p = d.length; f < p; f++) h.push(d[f].clone(e));
        this.morphAttributes[c] = h;
      }
      this.morphTargetsRelative = t.morphTargetsRelative;
      const a = t.groups;
      for (let c = 0, h = a.length; c < h; c++) {
        const d = a[c];
        this.addGroup(d.start, d.count, d.materialIndex);
      }
      const o = t.boundingBox;
      o !== null && (this.boundingBox = o.clone());
      const l = t.boundingSphere;
      return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = t.drawRange.start, this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
  }
  const el = new Zt(), Un = new is(), Ss = new Zn(), nl = new R(), ys = new R(), Es = new R(), bs = new R(), Tr = new R(), Ts = new R(), il = new R(), As = new R();
  class _e extends ve {
    constructor(t = new be(), e = new ss()) {
      super(), this.isMesh = true, this.type = "Mesh", this.geometry = t, this.material = e, this.updateMorphTargets();
    }
    copy(t, e) {
      return super.copy(t, e), t.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = t.morphTargetInfluences.slice()), t.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, t.morphTargetDictionary)), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
    }
    updateMorphTargets() {
      const e = this.geometry.morphAttributes, n = Object.keys(e);
      if (n.length > 0) {
        const s = e[n[0]];
        if (s !== void 0) {
          this.morphTargetInfluences = [], this.morphTargetDictionary = {};
          for (let r = 0, a = s.length; r < a; r++) {
            const o = s[r].name || String(r);
            this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r;
          }
        }
      }
    }
    getVertexPosition(t, e) {
      const n = this.geometry, s = n.attributes.position, r = n.morphAttributes.position, a = n.morphTargetsRelative;
      e.fromBufferAttribute(s, t);
      const o = this.morphTargetInfluences;
      if (r && o) {
        Ts.set(0, 0, 0);
        for (let l = 0, c = r.length; l < c; l++) {
          const h = o[l], d = r[l];
          h !== 0 && (Tr.fromBufferAttribute(d, t), a ? Ts.addScaledVector(Tr, h) : Ts.addScaledVector(Tr.sub(e), h));
        }
        e.add(Ts);
      }
      return e;
    }
    raycast(t, e) {
      const n = this.geometry, s = this.material, r = this.matrixWorld;
      s !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Ss.copy(n.boundingSphere), Ss.applyMatrix4(r), Un.copy(t.ray).recast(t.near), !(Ss.containsPoint(Un.origin) === false && (Un.intersectSphere(Ss, nl) === null || Un.origin.distanceToSquared(nl) > (t.far - t.near) ** 2)) && (el.copy(r).invert(), Un.copy(t.ray).applyMatrix4(el), !(n.boundingBox !== null && Un.intersectsBox(n.boundingBox) === false) && this._computeIntersections(t, e, Un)));
    }
    _computeIntersections(t, e, n) {
      let s;
      const r = this.geometry, a = this.material, o = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, d = r.attributes.normal, f = r.groups, p = r.drawRange;
      if (o !== null) if (Array.isArray(a)) for (let g = 0, v = f.length; g < v; g++) {
        const m = f[g], u = a[m.materialIndex], b = Math.max(m.start, p.start), E = Math.min(o.count, Math.min(m.start + m.count, p.start + p.count));
        for (let S = b, N = E; S < N; S += 3) {
          const A = o.getX(S), w = o.getX(S + 1), P = o.getX(S + 2);
          s = ws(this, u, t, n, c, h, d, A, w, P), s && (s.faceIndex = Math.floor(S / 3), s.face.materialIndex = m.materialIndex, e.push(s));
        }
      }
      else {
        const g = Math.max(0, p.start), v = Math.min(o.count, p.start + p.count);
        for (let m = g, u = v; m < u; m += 3) {
          const b = o.getX(m), E = o.getX(m + 1), S = o.getX(m + 2);
          s = ws(this, a, t, n, c, h, d, b, E, S), s && (s.faceIndex = Math.floor(m / 3), e.push(s));
        }
      }
      else if (l !== void 0) if (Array.isArray(a)) for (let g = 0, v = f.length; g < v; g++) {
        const m = f[g], u = a[m.materialIndex], b = Math.max(m.start, p.start), E = Math.min(l.count, Math.min(m.start + m.count, p.start + p.count));
        for (let S = b, N = E; S < N; S += 3) {
          const A = S, w = S + 1, P = S + 2;
          s = ws(this, u, t, n, c, h, d, A, w, P), s && (s.faceIndex = Math.floor(S / 3), s.face.materialIndex = m.materialIndex, e.push(s));
        }
      }
      else {
        const g = Math.max(0, p.start), v = Math.min(l.count, p.start + p.count);
        for (let m = g, u = v; m < u; m += 3) {
          const b = m, E = m + 1, S = m + 2;
          s = ws(this, a, t, n, c, h, d, b, E, S), s && (s.faceIndex = Math.floor(m / 3), e.push(s));
        }
      }
    }
  }
  function Zd(i, t, e, n, s, r, a, o) {
    let l;
    if (t.side === Ie ? l = n.intersectTriangle(a, r, s, true, o) : l = n.intersectTriangle(s, r, a, t.side === Pn, o), l === null) return null;
    As.copy(o), As.applyMatrix4(i.matrixWorld);
    const c = e.ray.origin.distanceTo(As);
    return c < e.near || c > e.far ? null : {
      distance: c,
      point: As.clone(),
      object: i
    };
  }
  function ws(i, t, e, n, s, r, a, o, l, c) {
    i.getVertexPosition(o, ys), i.getVertexPosition(l, Es), i.getVertexPosition(c, bs);
    const h = Zd(i, t, e, n, ys, Es, bs, il);
    if (h) {
      const d = new R();
      Ye.getBarycoord(il, ys, Es, bs, d), s && (h.uv = Ye.getInterpolatedAttribute(s, o, l, c, d, new _t())), r && (h.uv1 = Ye.getInterpolatedAttribute(r, o, l, c, d, new _t())), a && (h.normal = Ye.getInterpolatedAttribute(a, o, l, c, d, new R()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
      const f = {
        a: o,
        b: l,
        c,
        normal: new R(),
        materialIndex: 0
      };
      Ye.getNormal(ys, Es, bs, f.normal), h.face = f, h.barycoord = d;
    }
    return h;
  }
  class rs extends be {
    constructor(t = 1, e = 1, n = 1, s = 1, r = 1, a = 1) {
      super(), this.type = "BoxGeometry", this.parameters = {
        width: t,
        height: e,
        depth: n,
        widthSegments: s,
        heightSegments: r,
        depthSegments: a
      };
      const o = this;
      s = Math.floor(s), r = Math.floor(r), a = Math.floor(a);
      const l = [], c = [], h = [], d = [];
      let f = 0, p = 0;
      g("z", "y", "x", -1, -1, n, e, t, a, r, 0), g("z", "y", "x", 1, -1, n, e, -t, a, r, 1), g("x", "z", "y", 1, 1, t, n, e, s, a, 2), g("x", "z", "y", 1, -1, t, n, -e, s, a, 3), g("x", "y", "z", 1, -1, t, e, n, s, r, 4), g("x", "y", "z", -1, -1, t, e, -n, s, r, 5), this.setIndex(l), this.setAttribute("position", new fe(c, 3)), this.setAttribute("normal", new fe(h, 3)), this.setAttribute("uv", new fe(d, 2));
      function g(v, m, u, b, E, S, N, A, w, P, y) {
        const x = S / w, C = N / P, k = S / 2, z = N / 2, V = A / 2, Z = w + 1, W = P + 1;
        let tt = 0, G = 0;
        const st = new R();
        for (let ht = 0; ht < W; ht++) {
          const St = ht * C - z;
          for (let Ot = 0; Ot < Z; Ot++) {
            const Qt = Ot * x - k;
            st[v] = Qt * b, st[m] = St * E, st[u] = V, c.push(st.x, st.y, st.z), st[v] = 0, st[m] = 0, st[u] = A > 0 ? 1 : -1, h.push(st.x, st.y, st.z), d.push(Ot / w), d.push(1 - ht / P), tt += 1;
          }
        }
        for (let ht = 0; ht < P; ht++) for (let St = 0; St < w; St++) {
          const Ot = f + St + Z * ht, Qt = f + St + Z * (ht + 1), Y = f + (St + 1) + Z * (ht + 1), et = f + (St + 1) + Z * ht;
          l.push(Ot, Qt, et), l.push(Qt, Y, et), G += 6;
        }
        o.addGroup(p, G, y), p += G, f += tt;
      }
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new rs(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
    }
  }
  function Pi(i) {
    const t = {};
    for (const e in i) {
      t[e] = {};
      for (const n in i[e]) {
        const s = i[e][n];
        s && (s.isColor || s.isMatrix3 || s.isMatrix4 || s.isVector2 || s.isVector3 || s.isVector4 || s.isTexture || s.isQuaternion) ? s.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), t[e][n] = null) : t[e][n] = s.clone() : Array.isArray(s) ? t[e][n] = s.slice() : t[e][n] = s;
      }
    }
    return t;
  }
  function Ae(i) {
    const t = {};
    for (let e = 0; e < i.length; e++) {
      const n = Pi(i[e]);
      for (const s in n) t[s] = n[s];
    }
    return t;
  }
  function $d(i) {
    const t = [];
    for (let e = 0; e < i.length; e++) t.push(i[e].clone());
    return t;
  }
  function qc(i) {
    const t = i.getRenderTarget();
    return t === null ? i.outputColorSpace : t.isXRRenderTarget === true ? t.texture.colorSpace : Gt.workingColorSpace;
  }
  const ns = {
    clone: Pi,
    merge: Ae
  };
  var Jd = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Qd = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
  class de extends $n {
    static get type() {
      return "ShaderMaterial";
    }
    constructor(t) {
      super(), this.isShaderMaterial = true, this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Jd, this.fragmentShader = Qd, this.linewidth = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.fog = false, this.lights = false, this.clipping = false, this.forceSinglePass = true, this.extensions = {
        clipCullDistance: false,
        multiDraw: false
      }, this.defaultAttributeValues = {
        color: [
          1,
          1,
          1
        ],
        uv: [
          0,
          0
        ],
        uv1: [
          0,
          0
        ]
      }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = false, this.glslVersion = null, t !== void 0 && this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = Pi(t.uniforms), this.uniformsGroups = $d(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
    }
    toJSON(t) {
      const e = super.toJSON(t);
      e.glslVersion = this.glslVersion, e.uniforms = {};
      for (const s in this.uniforms) {
        const a = this.uniforms[s].value;
        a && a.isTexture ? e.uniforms[s] = {
          type: "t",
          value: a.toJSON(t).uuid
        } : a && a.isColor ? e.uniforms[s] = {
          type: "c",
          value: a.getHex()
        } : a && a.isVector2 ? e.uniforms[s] = {
          type: "v2",
          value: a.toArray()
        } : a && a.isVector3 ? e.uniforms[s] = {
          type: "v3",
          value: a.toArray()
        } : a && a.isVector4 ? e.uniforms[s] = {
          type: "v4",
          value: a.toArray()
        } : a && a.isMatrix3 ? e.uniforms[s] = {
          type: "m3",
          value: a.toArray()
        } : a && a.isMatrix4 ? e.uniforms[s] = {
          type: "m4",
          value: a.toArray()
        } : e.uniforms[s] = {
          value: a
        };
      }
      Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
      const n = {};
      for (const s in this.extensions) this.extensions[s] === true && (n[s] = true);
      return Object.keys(n).length > 0 && (e.extensions = n), e;
    }
  }
  class Yc extends ve {
    constructor() {
      super(), this.isCamera = true, this.type = "Camera", this.matrixWorldInverse = new Zt(), this.projectionMatrix = new Zt(), this.projectionMatrixInverse = new Zt(), this.coordinateSystem = dn;
    }
    copy(t, e) {
      return super.copy(t, e), this.matrixWorldInverse.copy(t.matrixWorldInverse), this.projectionMatrix.copy(t.projectionMatrix), this.projectionMatrixInverse.copy(t.projectionMatrixInverse), this.coordinateSystem = t.coordinateSystem, this;
    }
    getWorldDirection(t) {
      return super.getWorldDirection(t).negate();
    }
    updateMatrixWorld(t) {
      super.updateMatrixWorld(t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(t, e) {
      super.updateWorldMatrix(t, e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const bn = new R(), sl = new _t(), rl = new _t();
  class De extends Yc {
    constructor(t = 50, e = 1, n = 0.1, s = 2e3) {
      super(), this.isPerspectiveCamera = true, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = s, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
    }
    copy(t, e) {
      return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
    }
    setFocalLength(t) {
      const e = 0.5 * this.getFilmHeight() / t;
      this.fov = es * 2 * Math.atan(e), this.updateProjectionMatrix();
    }
    getFocalLength() {
      const t = Math.tan(Ji * 0.5 * this.fov);
      return 0.5 * this.getFilmHeight() / t;
    }
    getEffectiveFOV() {
      return es * 2 * Math.atan(Math.tan(Ji * 0.5 * this.fov) / this.zoom);
    }
    getFilmWidth() {
      return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
      return this.filmGauge / Math.max(this.aspect, 1);
    }
    getViewBounds(t, e, n) {
      bn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(bn.x, bn.y).multiplyScalar(-t / bn.z), bn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(bn.x, bn.y).multiplyScalar(-t / bn.z);
    }
    getViewSize(t, e) {
      return this.getViewBounds(t, sl, rl), e.subVectors(rl, sl);
    }
    setViewOffset(t, e, n, s, r, a) {
      this.aspect = t / e, this.view === null && (this.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = true, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = a, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = false), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const t = this.near;
      let e = t * Math.tan(Ji * 0.5 * this.fov) / this.zoom, n = 2 * e, s = this.aspect * n, r = -0.5 * s;
      const a = this.view;
      if (this.view !== null && this.view.enabled) {
        const l = a.fullWidth, c = a.fullHeight;
        r += a.offsetX * s / l, e -= a.offsetY * n / c, s *= a.width / l, n *= a.height / c;
      }
      const o = this.filmOffset;
      o !== 0 && (r += t * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + s, e, e - n, t, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, this.view !== null && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, e.object.filmOffset = this.filmOffset, e;
    }
  }
  const hi = -90, ui = 1;
  class tf extends ve {
    constructor(t, e, n) {
      super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
      const s = new De(hi, ui, t, e);
      s.layers = this.layers, this.add(s);
      const r = new De(hi, ui, t, e);
      r.layers = this.layers, this.add(r);
      const a = new De(hi, ui, t, e);
      a.layers = this.layers, this.add(a);
      const o = new De(hi, ui, t, e);
      o.layers = this.layers, this.add(o);
      const l = new De(hi, ui, t, e);
      l.layers = this.layers, this.add(l);
      const c = new De(hi, ui, t, e);
      c.layers = this.layers, this.add(c);
    }
    updateCoordinateSystem() {
      const t = this.coordinateSystem, e = this.children.concat(), [n, s, r, a, o, l] = e;
      for (const c of e) this.remove(c);
      if (t === dn) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
      else if (t === qs) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), s.up.set(0, -1, 0), s.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
      else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
      for (const c of e) this.add(c), c.updateMatrixWorld();
    }
    update(t, e) {
      this.parent === null && this.updateMatrixWorld();
      const { renderTarget: n, activeMipmapLevel: s } = this;
      this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
      const [r, a, o, l, c, h] = this.children, d = t.getRenderTarget(), f = t.getActiveCubeFace(), p = t.getActiveMipmapLevel(), g = t.xr.enabled;
      t.xr.enabled = false;
      const v = n.texture.generateMipmaps;
      n.texture.generateMipmaps = false, t.setRenderTarget(n, 0, s), t.render(e, r), t.setRenderTarget(n, 1, s), t.render(e, a), t.setRenderTarget(n, 2, s), t.render(e, o), t.setRenderTarget(n, 3, s), t.render(e, l), t.setRenderTarget(n, 4, s), t.render(e, c), n.texture.generateMipmaps = v, t.setRenderTarget(n, 5, s), t.render(e, h), t.setRenderTarget(d, f, p), t.xr.enabled = g, n.texture.needsPMREMUpdate = true;
    }
  }
  class jc extends we {
    constructor(t, e, n, s, r, a, o, l, c, h) {
      t = t !== void 0 ? t : [], e = e !== void 0 ? e : Ai, super(t, e, n, s, r, a, o, l, c, h), this.isCubeTexture = true, this.flipY = false;
    }
    get images() {
      return this.image;
    }
    set images(t) {
      this.image = t;
    }
  }
  class ef extends Ze {
    constructor(t = 1, e = {}) {
      super(t, t, e), this.isWebGLCubeRenderTarget = true;
      const n = {
        width: t,
        height: t,
        depth: 1
      }, s = [
        n,
        n,
        n,
        n,
        n,
        n
      ];
      this.texture = new jc(s, e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.format, e.type, e.anisotropy, e.colorSpace), this.texture.isRenderTargetTexture = true, this.texture.generateMipmaps = e.generateMipmaps !== void 0 ? e.generateMipmaps : false, this.texture.minFilter = e.minFilter !== void 0 ? e.minFilter : Qe;
    }
    fromEquirectangularTexture(t, e) {
      this.texture.type = e.type, this.texture.colorSpace = e.colorSpace, this.texture.generateMipmaps = e.generateMipmaps, this.texture.minFilter = e.minFilter, this.texture.magFilter = e.magFilter;
      const n = {
        uniforms: {
          tEquirect: {
            value: null
          }
        },
        vertexShader: `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,
        fragmentShader: `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      }, s = new rs(5, 5, 5), r = new de({
        name: "CubemapFromEquirect",
        uniforms: Pi(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: Ie,
        blending: fn
      });
      r.uniforms.tEquirect.value = e;
      const a = new _e(s, r), o = e.minFilter;
      return e.minFilter === Gn && (e.minFilter = Qe), new tf(1, 10, this).update(t, a), e.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
    }
    clear(t, e, n, s) {
      const r = t.getRenderTarget();
      for (let a = 0; a < 6; a++) t.setRenderTarget(this, a), t.clear(e, n, s);
      t.setRenderTarget(r);
    }
  }
  const Ar = new R(), nf = new R(), sf = new Ut();
  class Tn {
    constructor(t = new R(1, 0, 0), e = 0) {
      this.isPlane = true, this.normal = t, this.constant = e;
    }
    set(t, e) {
      return this.normal.copy(t), this.constant = e, this;
    }
    setComponents(t, e, n, s) {
      return this.normal.set(t, e, n), this.constant = s, this;
    }
    setFromNormalAndCoplanarPoint(t, e) {
      return this.normal.copy(t), this.constant = -e.dot(this.normal), this;
    }
    setFromCoplanarPoints(t, e, n) {
      const s = Ar.subVectors(n, e).cross(nf.subVectors(t, e)).normalize();
      return this.setFromNormalAndCoplanarPoint(s, t), this;
    }
    copy(t) {
      return this.normal.copy(t.normal), this.constant = t.constant, this;
    }
    normalize() {
      const t = 1 / this.normal.length();
      return this.normal.multiplyScalar(t), this.constant *= t, this;
    }
    negate() {
      return this.constant *= -1, this.normal.negate(), this;
    }
    distanceToPoint(t) {
      return this.normal.dot(t) + this.constant;
    }
    distanceToSphere(t) {
      return this.distanceToPoint(t.center) - t.radius;
    }
    projectPoint(t, e) {
      return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
    }
    intersectLine(t, e) {
      const n = t.delta(Ar), s = this.normal.dot(n);
      if (s === 0) return this.distanceToPoint(t.start) === 0 ? e.copy(t.start) : null;
      const r = -(t.start.dot(this.normal) + this.constant) / s;
      return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(n, r);
    }
    intersectsLine(t) {
      const e = this.distanceToPoint(t.start), n = this.distanceToPoint(t.end);
      return e < 0 && n > 0 || n < 0 && e > 0;
    }
    intersectsBox(t) {
      return t.intersectsPlane(this);
    }
    intersectsSphere(t) {
      return t.intersectsPlane(this);
    }
    coplanarPoint(t) {
      return t.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(t, e) {
      const n = e || sf.getNormalMatrix(t), s = this.coplanarPoint(Ar).applyMatrix4(t), r = this.normal.applyMatrix3(n).normalize();
      return this.constant = -s.dot(r), this;
    }
    translate(t) {
      return this.constant -= t.dot(this.normal), this;
    }
    equals(t) {
      return t.normal.equals(this.normal) && t.constant === this.constant;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const Nn = new Zn(), Cs = new R();
  class ja {
    constructor(t = new Tn(), e = new Tn(), n = new Tn(), s = new Tn(), r = new Tn(), a = new Tn()) {
      this.planes = [
        t,
        e,
        n,
        s,
        r,
        a
      ];
    }
    set(t, e, n, s, r, a) {
      const o = this.planes;
      return o[0].copy(t), o[1].copy(e), o[2].copy(n), o[3].copy(s), o[4].copy(r), o[5].copy(a), this;
    }
    copy(t) {
      const e = this.planes;
      for (let n = 0; n < 6; n++) e[n].copy(t.planes[n]);
      return this;
    }
    setFromProjectionMatrix(t, e = dn) {
      const n = this.planes, s = t.elements, r = s[0], a = s[1], o = s[2], l = s[3], c = s[4], h = s[5], d = s[6], f = s[7], p = s[8], g = s[9], v = s[10], m = s[11], u = s[12], b = s[13], E = s[14], S = s[15];
      if (n[0].setComponents(l - r, f - c, m - p, S - u).normalize(), n[1].setComponents(l + r, f + c, m + p, S + u).normalize(), n[2].setComponents(l + a, f + h, m + g, S + b).normalize(), n[3].setComponents(l - a, f - h, m - g, S - b).normalize(), n[4].setComponents(l - o, f - d, m - v, S - E).normalize(), e === dn) n[5].setComponents(l + o, f + d, m + v, S + E).normalize();
      else if (e === qs) n[5].setComponents(o, d, v, E).normalize();
      else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
      return this;
    }
    intersectsObject(t) {
      if (t.boundingSphere !== void 0) t.boundingSphere === null && t.computeBoundingSphere(), Nn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
      else {
        const e = t.geometry;
        e.boundingSphere === null && e.computeBoundingSphere(), Nn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
      }
      return this.intersectsSphere(Nn);
    }
    intersectsSprite(t) {
      return Nn.center.set(0, 0, 0), Nn.radius = 0.7071067811865476, Nn.applyMatrix4(t.matrixWorld), this.intersectsSphere(Nn);
    }
    intersectsSphere(t) {
      const e = this.planes, n = t.center, s = -t.radius;
      for (let r = 0; r < 6; r++) if (e[r].distanceToPoint(n) < s) return false;
      return true;
    }
    intersectsBox(t) {
      const e = this.planes;
      for (let n = 0; n < 6; n++) {
        const s = e[n];
        if (Cs.x = s.normal.x > 0 ? t.max.x : t.min.x, Cs.y = s.normal.y > 0 ? t.max.y : t.min.y, Cs.z = s.normal.z > 0 ? t.max.z : t.min.z, s.distanceToPoint(Cs) < 0) return false;
      }
      return true;
    }
    containsPoint(t) {
      const e = this.planes;
      for (let n = 0; n < 6; n++) if (e[n].distanceToPoint(t) < 0) return false;
      return true;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  function Kc() {
    let i = null, t = false, e = null, n = null;
    function s(r, a) {
      e(r, a), n = i.requestAnimationFrame(s);
    }
    return {
      start: function() {
        t !== true && e !== null && (n = i.requestAnimationFrame(s), t = true);
      },
      stop: function() {
        i.cancelAnimationFrame(n), t = false;
      },
      setAnimationLoop: function(r) {
        e = r;
      },
      setContext: function(r) {
        i = r;
      }
    };
  }
  function rf(i) {
    const t = /* @__PURE__ */ new WeakMap();
    function e(o, l) {
      const c = o.array, h = o.usage, d = c.byteLength, f = i.createBuffer();
      i.bindBuffer(l, f), i.bufferData(l, c, h), o.onUploadCallback();
      let p;
      if (c instanceof Float32Array) p = i.FLOAT;
      else if (c instanceof Uint16Array) o.isFloat16BufferAttribute ? p = i.HALF_FLOAT : p = i.UNSIGNED_SHORT;
      else if (c instanceof Int16Array) p = i.SHORT;
      else if (c instanceof Uint32Array) p = i.UNSIGNED_INT;
      else if (c instanceof Int32Array) p = i.INT;
      else if (c instanceof Int8Array) p = i.BYTE;
      else if (c instanceof Uint8Array) p = i.UNSIGNED_BYTE;
      else if (c instanceof Uint8ClampedArray) p = i.UNSIGNED_BYTE;
      else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
      return {
        buffer: f,
        type: p,
        bytesPerElement: c.BYTES_PER_ELEMENT,
        version: o.version,
        size: d
      };
    }
    function n(o, l, c) {
      const h = l.array, d = l.updateRanges;
      if (i.bindBuffer(c, o), d.length === 0) i.bufferSubData(c, 0, h);
      else {
        d.sort((p, g) => p.start - g.start);
        let f = 0;
        for (let p = 1; p < d.length; p++) {
          const g = d[f], v = d[p];
          v.start <= g.start + g.count + 1 ? g.count = Math.max(g.count, v.start + v.count - g.start) : (++f, d[f] = v);
        }
        d.length = f + 1;
        for (let p = 0, g = d.length; p < g; p++) {
          const v = d[p];
          i.bufferSubData(c, v.start * h.BYTES_PER_ELEMENT, h, v.start, v.count);
        }
        l.clearUpdateRanges();
      }
      l.onUploadCallback();
    }
    function s(o) {
      return o.isInterleavedBufferAttribute && (o = o.data), t.get(o);
    }
    function r(o) {
      o.isInterleavedBufferAttribute && (o = o.data);
      const l = t.get(o);
      l && (i.deleteBuffer(l.buffer), t.delete(o));
    }
    function a(o, l) {
      if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
        const h = t.get(o);
        (!h || h.version < o.version) && t.set(o, {
          buffer: o.buffer,
          type: o.type,
          bytesPerElement: o.elementSize,
          version: o.version
        });
        return;
      }
      const c = t.get(o);
      if (c === void 0) t.set(o, e(o, l));
      else if (c.version < o.version) {
        if (c.size !== o.array.byteLength) throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
        n(c.buffer, o, l), c.version = o.version;
      }
    }
    return {
      get: s,
      remove: r,
      update: a
    };
  }
  class Ui extends be {
    constructor(t = 1, e = 1, n = 1, s = 1) {
      super(), this.type = "PlaneGeometry", this.parameters = {
        width: t,
        height: e,
        widthSegments: n,
        heightSegments: s
      };
      const r = t / 2, a = e / 2, o = Math.floor(n), l = Math.floor(s), c = o + 1, h = l + 1, d = t / o, f = e / l, p = [], g = [], v = [], m = [];
      for (let u = 0; u < h; u++) {
        const b = u * f - a;
        for (let E = 0; E < c; E++) {
          const S = E * d - r;
          g.push(S, -b, 0), v.push(0, 0, 1), m.push(E / o), m.push(1 - u / l);
        }
      }
      for (let u = 0; u < l; u++) for (let b = 0; b < o; b++) {
        const E = b + c * u, S = b + c * (u + 1), N = b + 1 + c * (u + 1), A = b + 1 + c * u;
        p.push(E, S, A), p.push(S, N, A);
      }
      this.setIndex(p), this.setAttribute("position", new fe(g, 3)), this.setAttribute("normal", new fe(v, 3)), this.setAttribute("uv", new fe(m, 2));
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new Ui(t.width, t.height, t.widthSegments, t.heightSegments);
    }
  }
  var af = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, of = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, lf = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, cf = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, hf = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, uf = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, df = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, ff = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, pf = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, mf = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, gf = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, _f = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, vf = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, xf = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, Mf = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, Sf = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, yf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, Ef = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, bf = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Tf = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, Af = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, wf = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Cf = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`, Rf = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, Pf = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, Df = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, If = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Lf = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Uf = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Nf = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Ff = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Of = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, Bf = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, zf = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, kf = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, Hf = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Gf = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, Vf = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Wf = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Xf = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, qf = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Yf = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, jf = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Kf = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Zf = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, $f = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, Jf = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, Qf = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, tp = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, ep = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, np = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, ip = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, sp = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, rp = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, ap = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, op = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, lp = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, cp = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, hp = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, up = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, dp = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, fp = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, pp = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, mp = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, gp = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, _p = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, vp = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, xp = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Mp = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Sp = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, yp = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Ep = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, bp = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, Tp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Ap = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, wp = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Cp = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, Rp = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Pp = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Dp = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Ip = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, Lp = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, Up = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, Np = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Fp = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Op = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Bp = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, zp = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, kp = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Hp = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`, Gp = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, Vp = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, Wp = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, Xp = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, qp = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, Yp = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, jp = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, Kp = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Zp = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, $p = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Jp = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, Qp = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, tm = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, em = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, nm = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, im = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, sm = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
  const rm = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, am = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, om = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, lm = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, cm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, hm = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, um = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, dm = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`, fm = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, pm = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, mm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, gm = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, _m = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, vm = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, xm = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, Mm = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Sm = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, ym = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Em = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, bm = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Tm = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, Am = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, wm = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Cm = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Rm = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, Pm = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Dm = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Im = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Lm = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, Um = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Nm = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Fm = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Om = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, Bm = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Ft = {
    alphahash_fragment: af,
    alphahash_pars_fragment: of,
    alphamap_fragment: lf,
    alphamap_pars_fragment: cf,
    alphatest_fragment: hf,
    alphatest_pars_fragment: uf,
    aomap_fragment: df,
    aomap_pars_fragment: ff,
    batching_pars_vertex: pf,
    batching_vertex: mf,
    begin_vertex: gf,
    beginnormal_vertex: _f,
    bsdfs: vf,
    iridescence_fragment: xf,
    bumpmap_pars_fragment: Mf,
    clipping_planes_fragment: Sf,
    clipping_planes_pars_fragment: yf,
    clipping_planes_pars_vertex: Ef,
    clipping_planes_vertex: bf,
    color_fragment: Tf,
    color_pars_fragment: Af,
    color_pars_vertex: wf,
    color_vertex: Cf,
    common: Rf,
    cube_uv_reflection_fragment: Pf,
    defaultnormal_vertex: Df,
    displacementmap_pars_vertex: If,
    displacementmap_vertex: Lf,
    emissivemap_fragment: Uf,
    emissivemap_pars_fragment: Nf,
    colorspace_fragment: Ff,
    colorspace_pars_fragment: Of,
    envmap_fragment: Bf,
    envmap_common_pars_fragment: zf,
    envmap_pars_fragment: kf,
    envmap_pars_vertex: Hf,
    envmap_physical_pars_fragment: Jf,
    envmap_vertex: Gf,
    fog_vertex: Vf,
    fog_pars_vertex: Wf,
    fog_fragment: Xf,
    fog_pars_fragment: qf,
    gradientmap_pars_fragment: Yf,
    lightmap_pars_fragment: jf,
    lights_lambert_fragment: Kf,
    lights_lambert_pars_fragment: Zf,
    lights_pars_begin: $f,
    lights_toon_fragment: Qf,
    lights_toon_pars_fragment: tp,
    lights_phong_fragment: ep,
    lights_phong_pars_fragment: np,
    lights_physical_fragment: ip,
    lights_physical_pars_fragment: sp,
    lights_fragment_begin: rp,
    lights_fragment_maps: ap,
    lights_fragment_end: op,
    logdepthbuf_fragment: lp,
    logdepthbuf_pars_fragment: cp,
    logdepthbuf_pars_vertex: hp,
    logdepthbuf_vertex: up,
    map_fragment: dp,
    map_pars_fragment: fp,
    map_particle_fragment: pp,
    map_particle_pars_fragment: mp,
    metalnessmap_fragment: gp,
    metalnessmap_pars_fragment: _p,
    morphinstance_vertex: vp,
    morphcolor_vertex: xp,
    morphnormal_vertex: Mp,
    morphtarget_pars_vertex: Sp,
    morphtarget_vertex: yp,
    normal_fragment_begin: Ep,
    normal_fragment_maps: bp,
    normal_pars_fragment: Tp,
    normal_pars_vertex: Ap,
    normal_vertex: wp,
    normalmap_pars_fragment: Cp,
    clearcoat_normal_fragment_begin: Rp,
    clearcoat_normal_fragment_maps: Pp,
    clearcoat_pars_fragment: Dp,
    iridescence_pars_fragment: Ip,
    opaque_fragment: Lp,
    packing: Up,
    premultiplied_alpha_fragment: Np,
    project_vertex: Fp,
    dithering_fragment: Op,
    dithering_pars_fragment: Bp,
    roughnessmap_fragment: zp,
    roughnessmap_pars_fragment: kp,
    shadowmap_pars_fragment: Hp,
    shadowmap_pars_vertex: Gp,
    shadowmap_vertex: Vp,
    shadowmask_pars_fragment: Wp,
    skinbase_vertex: Xp,
    skinning_pars_vertex: qp,
    skinning_vertex: Yp,
    skinnormal_vertex: jp,
    specularmap_fragment: Kp,
    specularmap_pars_fragment: Zp,
    tonemapping_fragment: $p,
    tonemapping_pars_fragment: Jp,
    transmission_fragment: Qp,
    transmission_pars_fragment: tm,
    uv_pars_fragment: em,
    uv_pars_vertex: nm,
    uv_vertex: im,
    worldpos_vertex: sm,
    background_vert: rm,
    background_frag: am,
    backgroundCube_vert: om,
    backgroundCube_frag: lm,
    cube_vert: cm,
    cube_frag: hm,
    depth_vert: um,
    depth_frag: dm,
    distanceRGBA_vert: fm,
    distanceRGBA_frag: pm,
    equirect_vert: mm,
    equirect_frag: gm,
    linedashed_vert: _m,
    linedashed_frag: vm,
    meshbasic_vert: xm,
    meshbasic_frag: Mm,
    meshlambert_vert: Sm,
    meshlambert_frag: ym,
    meshmatcap_vert: Em,
    meshmatcap_frag: bm,
    meshnormal_vert: Tm,
    meshnormal_frag: Am,
    meshphong_vert: wm,
    meshphong_frag: Cm,
    meshphysical_vert: Rm,
    meshphysical_frag: Pm,
    meshtoon_vert: Dm,
    meshtoon_frag: Im,
    points_vert: Lm,
    points_frag: Um,
    shadow_vert: Nm,
    shadow_frag: Fm,
    sprite_vert: Om,
    sprite_frag: Bm
  }, nt = {
    common: {
      diffuse: {
        value: new Pt(16777215)
      },
      opacity: {
        value: 1
      },
      map: {
        value: null
      },
      mapTransform: {
        value: new Ut()
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new Ut()
      },
      alphaTest: {
        value: 0
      }
    },
    specularmap: {
      specularMap: {
        value: null
      },
      specularMapTransform: {
        value: new Ut()
      }
    },
    envmap: {
      envMap: {
        value: null
      },
      envMapRotation: {
        value: new Ut()
      },
      flipEnvMap: {
        value: -1
      },
      reflectivity: {
        value: 1
      },
      ior: {
        value: 1.5
      },
      refractionRatio: {
        value: 0.98
      }
    },
    aomap: {
      aoMap: {
        value: null
      },
      aoMapIntensity: {
        value: 1
      },
      aoMapTransform: {
        value: new Ut()
      }
    },
    lightmap: {
      lightMap: {
        value: null
      },
      lightMapIntensity: {
        value: 1
      },
      lightMapTransform: {
        value: new Ut()
      }
    },
    bumpmap: {
      bumpMap: {
        value: null
      },
      bumpMapTransform: {
        value: new Ut()
      },
      bumpScale: {
        value: 1
      }
    },
    normalmap: {
      normalMap: {
        value: null
      },
      normalMapTransform: {
        value: new Ut()
      },
      normalScale: {
        value: new _t(1, 1)
      }
    },
    displacementmap: {
      displacementMap: {
        value: null
      },
      displacementMapTransform: {
        value: new Ut()
      },
      displacementScale: {
        value: 1
      },
      displacementBias: {
        value: 0
      }
    },
    emissivemap: {
      emissiveMap: {
        value: null
      },
      emissiveMapTransform: {
        value: new Ut()
      }
    },
    metalnessmap: {
      metalnessMap: {
        value: null
      },
      metalnessMapTransform: {
        value: new Ut()
      }
    },
    roughnessmap: {
      roughnessMap: {
        value: null
      },
      roughnessMapTransform: {
        value: new Ut()
      }
    },
    gradientmap: {
      gradientMap: {
        value: null
      }
    },
    fog: {
      fogDensity: {
        value: 25e-5
      },
      fogNear: {
        value: 1
      },
      fogFar: {
        value: 2e3
      },
      fogColor: {
        value: new Pt(16777215)
      }
    },
    lights: {
      ambientLightColor: {
        value: []
      },
      lightProbe: {
        value: []
      },
      directionalLights: {
        value: [],
        properties: {
          direction: {},
          color: {}
        }
      },
      directionalLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      directionalShadowMap: {
        value: []
      },
      directionalShadowMatrix: {
        value: []
      },
      spotLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          direction: {},
          distance: {},
          coneCos: {},
          penumbraCos: {},
          decay: {}
        }
      },
      spotLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {}
        }
      },
      spotLightMap: {
        value: []
      },
      spotShadowMap: {
        value: []
      },
      spotLightMatrix: {
        value: []
      },
      pointLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          decay: {},
          distance: {}
        }
      },
      pointLightShadows: {
        value: [],
        properties: {
          shadowIntensity: 1,
          shadowBias: {},
          shadowNormalBias: {},
          shadowRadius: {},
          shadowMapSize: {},
          shadowCameraNear: {},
          shadowCameraFar: {}
        }
      },
      pointShadowMap: {
        value: []
      },
      pointShadowMatrix: {
        value: []
      },
      hemisphereLights: {
        value: [],
        properties: {
          direction: {},
          skyColor: {},
          groundColor: {}
        }
      },
      rectAreaLights: {
        value: [],
        properties: {
          color: {},
          position: {},
          width: {},
          height: {}
        }
      },
      ltc_1: {
        value: null
      },
      ltc_2: {
        value: null
      }
    },
    points: {
      diffuse: {
        value: new Pt(16777215)
      },
      opacity: {
        value: 1
      },
      size: {
        value: 1
      },
      scale: {
        value: 1
      },
      map: {
        value: null
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new Ut()
      },
      alphaTest: {
        value: 0
      },
      uvTransform: {
        value: new Ut()
      }
    },
    sprite: {
      diffuse: {
        value: new Pt(16777215)
      },
      opacity: {
        value: 1
      },
      center: {
        value: new _t(0.5, 0.5)
      },
      rotation: {
        value: 0
      },
      map: {
        value: null
      },
      mapTransform: {
        value: new Ut()
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new Ut()
      },
      alphaTest: {
        value: 0
      }
    }
  }, Je = {
    basic: {
      uniforms: Ae([
        nt.common,
        nt.specularmap,
        nt.envmap,
        nt.aomap,
        nt.lightmap,
        nt.fog
      ]),
      vertexShader: Ft.meshbasic_vert,
      fragmentShader: Ft.meshbasic_frag
    },
    lambert: {
      uniforms: Ae([
        nt.common,
        nt.specularmap,
        nt.envmap,
        nt.aomap,
        nt.lightmap,
        nt.emissivemap,
        nt.bumpmap,
        nt.normalmap,
        nt.displacementmap,
        nt.fog,
        nt.lights,
        {
          emissive: {
            value: new Pt(0)
          }
        }
      ]),
      vertexShader: Ft.meshlambert_vert,
      fragmentShader: Ft.meshlambert_frag
    },
    phong: {
      uniforms: Ae([
        nt.common,
        nt.specularmap,
        nt.envmap,
        nt.aomap,
        nt.lightmap,
        nt.emissivemap,
        nt.bumpmap,
        nt.normalmap,
        nt.displacementmap,
        nt.fog,
        nt.lights,
        {
          emissive: {
            value: new Pt(0)
          },
          specular: {
            value: new Pt(1118481)
          },
          shininess: {
            value: 30
          }
        }
      ]),
      vertexShader: Ft.meshphong_vert,
      fragmentShader: Ft.meshphong_frag
    },
    standard: {
      uniforms: Ae([
        nt.common,
        nt.envmap,
        nt.aomap,
        nt.lightmap,
        nt.emissivemap,
        nt.bumpmap,
        nt.normalmap,
        nt.displacementmap,
        nt.roughnessmap,
        nt.metalnessmap,
        nt.fog,
        nt.lights,
        {
          emissive: {
            value: new Pt(0)
          },
          roughness: {
            value: 1
          },
          metalness: {
            value: 0
          },
          envMapIntensity: {
            value: 1
          }
        }
      ]),
      vertexShader: Ft.meshphysical_vert,
      fragmentShader: Ft.meshphysical_frag
    },
    toon: {
      uniforms: Ae([
        nt.common,
        nt.aomap,
        nt.lightmap,
        nt.emissivemap,
        nt.bumpmap,
        nt.normalmap,
        nt.displacementmap,
        nt.gradientmap,
        nt.fog,
        nt.lights,
        {
          emissive: {
            value: new Pt(0)
          }
        }
      ]),
      vertexShader: Ft.meshtoon_vert,
      fragmentShader: Ft.meshtoon_frag
    },
    matcap: {
      uniforms: Ae([
        nt.common,
        nt.bumpmap,
        nt.normalmap,
        nt.displacementmap,
        nt.fog,
        {
          matcap: {
            value: null
          }
        }
      ]),
      vertexShader: Ft.meshmatcap_vert,
      fragmentShader: Ft.meshmatcap_frag
    },
    points: {
      uniforms: Ae([
        nt.points,
        nt.fog
      ]),
      vertexShader: Ft.points_vert,
      fragmentShader: Ft.points_frag
    },
    dashed: {
      uniforms: Ae([
        nt.common,
        nt.fog,
        {
          scale: {
            value: 1
          },
          dashSize: {
            value: 1
          },
          totalSize: {
            value: 2
          }
        }
      ]),
      vertexShader: Ft.linedashed_vert,
      fragmentShader: Ft.linedashed_frag
    },
    depth: {
      uniforms: Ae([
        nt.common,
        nt.displacementmap
      ]),
      vertexShader: Ft.depth_vert,
      fragmentShader: Ft.depth_frag
    },
    normal: {
      uniforms: Ae([
        nt.common,
        nt.bumpmap,
        nt.normalmap,
        nt.displacementmap,
        {
          opacity: {
            value: 1
          }
        }
      ]),
      vertexShader: Ft.meshnormal_vert,
      fragmentShader: Ft.meshnormal_frag
    },
    sprite: {
      uniforms: Ae([
        nt.sprite,
        nt.fog
      ]),
      vertexShader: Ft.sprite_vert,
      fragmentShader: Ft.sprite_frag
    },
    background: {
      uniforms: {
        uvTransform: {
          value: new Ut()
        },
        t2D: {
          value: null
        },
        backgroundIntensity: {
          value: 1
        }
      },
      vertexShader: Ft.background_vert,
      fragmentShader: Ft.background_frag
    },
    backgroundCube: {
      uniforms: {
        envMap: {
          value: null
        },
        flipEnvMap: {
          value: -1
        },
        backgroundBlurriness: {
          value: 0
        },
        backgroundIntensity: {
          value: 1
        },
        backgroundRotation: {
          value: new Ut()
        }
      },
      vertexShader: Ft.backgroundCube_vert,
      fragmentShader: Ft.backgroundCube_frag
    },
    cube: {
      uniforms: {
        tCube: {
          value: null
        },
        tFlip: {
          value: -1
        },
        opacity: {
          value: 1
        }
      },
      vertexShader: Ft.cube_vert,
      fragmentShader: Ft.cube_frag
    },
    equirect: {
      uniforms: {
        tEquirect: {
          value: null
        }
      },
      vertexShader: Ft.equirect_vert,
      fragmentShader: Ft.equirect_frag
    },
    distanceRGBA: {
      uniforms: Ae([
        nt.common,
        nt.displacementmap,
        {
          referencePosition: {
            value: new R()
          },
          nearDistance: {
            value: 1
          },
          farDistance: {
            value: 1e3
          }
        }
      ]),
      vertexShader: Ft.distanceRGBA_vert,
      fragmentShader: Ft.distanceRGBA_frag
    },
    shadow: {
      uniforms: Ae([
        nt.lights,
        nt.fog,
        {
          color: {
            value: new Pt(0)
          },
          opacity: {
            value: 1
          }
        }
      ]),
      vertexShader: Ft.shadow_vert,
      fragmentShader: Ft.shadow_frag
    }
  };
  Je.physical = {
    uniforms: Ae([
      Je.standard.uniforms,
      {
        clearcoat: {
          value: 0
        },
        clearcoatMap: {
          value: null
        },
        clearcoatMapTransform: {
          value: new Ut()
        },
        clearcoatNormalMap: {
          value: null
        },
        clearcoatNormalMapTransform: {
          value: new Ut()
        },
        clearcoatNormalScale: {
          value: new _t(1, 1)
        },
        clearcoatRoughness: {
          value: 0
        },
        clearcoatRoughnessMap: {
          value: null
        },
        clearcoatRoughnessMapTransform: {
          value: new Ut()
        },
        dispersion: {
          value: 0
        },
        iridescence: {
          value: 0
        },
        iridescenceMap: {
          value: null
        },
        iridescenceMapTransform: {
          value: new Ut()
        },
        iridescenceIOR: {
          value: 1.3
        },
        iridescenceThicknessMinimum: {
          value: 100
        },
        iridescenceThicknessMaximum: {
          value: 400
        },
        iridescenceThicknessMap: {
          value: null
        },
        iridescenceThicknessMapTransform: {
          value: new Ut()
        },
        sheen: {
          value: 0
        },
        sheenColor: {
          value: new Pt(0)
        },
        sheenColorMap: {
          value: null
        },
        sheenColorMapTransform: {
          value: new Ut()
        },
        sheenRoughness: {
          value: 1
        },
        sheenRoughnessMap: {
          value: null
        },
        sheenRoughnessMapTransform: {
          value: new Ut()
        },
        transmission: {
          value: 0
        },
        transmissionMap: {
          value: null
        },
        transmissionMapTransform: {
          value: new Ut()
        },
        transmissionSamplerSize: {
          value: new _t()
        },
        transmissionSamplerMap: {
          value: null
        },
        thickness: {
          value: 0
        },
        thicknessMap: {
          value: null
        },
        thicknessMapTransform: {
          value: new Ut()
        },
        attenuationDistance: {
          value: 0
        },
        attenuationColor: {
          value: new Pt(0)
        },
        specularColor: {
          value: new Pt(1, 1, 1)
        },
        specularColorMap: {
          value: null
        },
        specularColorMapTransform: {
          value: new Ut()
        },
        specularIntensity: {
          value: 1
        },
        specularIntensityMap: {
          value: null
        },
        specularIntensityMapTransform: {
          value: new Ut()
        },
        anisotropyVector: {
          value: new _t()
        },
        anisotropyMap: {
          value: null
        },
        anisotropyMapTransform: {
          value: new Ut()
        }
      }
    ]),
    vertexShader: Ft.meshphysical_vert,
    fragmentShader: Ft.meshphysical_frag
  };
  const Rs = {
    r: 0,
    b: 0,
    g: 0
  }, Fn = new nn(), zm = new Zt();
  function km(i, t, e, n, s, r, a) {
    const o = new Pt(0);
    let l = r === true ? 0 : 1, c, h, d = null, f = 0, p = null;
    function g(b) {
      let E = b.isScene === true ? b.background : null;
      return E && E.isTexture && (E = (b.backgroundBlurriness > 0 ? e : t).get(E)), E;
    }
    function v(b) {
      let E = false;
      const S = g(b);
      S === null ? u(o, l) : S && S.isColor && (u(S, 1), E = true);
      const N = i.xr.getEnvironmentBlendMode();
      N === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : N === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || E) && (n.buffers.depth.setTest(true), n.buffers.depth.setMask(true), n.buffers.color.setMask(true), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
    }
    function m(b, E) {
      const S = g(E);
      S && (S.isCubeTexture || S.mapping === Js) ? (h === void 0 && (h = new _e(new rs(1, 1, 1), new de({
        name: "BackgroundCubeMaterial",
        uniforms: Pi(Je.backgroundCube.uniforms),
        vertexShader: Je.backgroundCube.vertexShader,
        fragmentShader: Je.backgroundCube.fragmentShader,
        side: Ie,
        depthTest: false,
        depthWrite: false,
        fog: false
      })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(N, A, w) {
        this.matrixWorld.copyPosition(w.matrixWorld);
      }, Object.defineProperty(h.material, "envMap", {
        get: function() {
          return this.uniforms.envMap.value;
        }
      }), s.update(h)), Fn.copy(E.backgroundRotation), Fn.x *= -1, Fn.y *= -1, Fn.z *= -1, S.isCubeTexture && S.isRenderTargetTexture === false && (Fn.y *= -1, Fn.z *= -1), h.material.uniforms.envMap.value = S, h.material.uniforms.flipEnvMap.value = S.isCubeTexture && S.isRenderTargetTexture === false ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = E.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(zm.makeRotationFromEuler(Fn)), h.material.toneMapped = Gt.getTransfer(S.colorSpace) !== Kt, (d !== S || f !== S.version || p !== i.toneMapping) && (h.material.needsUpdate = true, d = S, f = S.version, p = i.toneMapping), h.layers.enableAll(), b.unshift(h, h.geometry, h.material, 0, 0, null)) : S && S.isTexture && (c === void 0 && (c = new _e(new Ui(2, 2), new de({
        name: "BackgroundMaterial",
        uniforms: Pi(Je.background.uniforms),
        vertexShader: Je.background.vertexShader,
        fragmentShader: Je.background.fragmentShader,
        side: Pn,
        depthTest: false,
        depthWrite: false,
        fog: false
      })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
        get: function() {
          return this.uniforms.t2D.value;
        }
      }), s.update(c)), c.material.uniforms.t2D.value = S, c.material.uniforms.backgroundIntensity.value = E.backgroundIntensity, c.material.toneMapped = Gt.getTransfer(S.colorSpace) !== Kt, S.matrixAutoUpdate === true && S.updateMatrix(), c.material.uniforms.uvTransform.value.copy(S.matrix), (d !== S || f !== S.version || p !== i.toneMapping) && (c.material.needsUpdate = true, d = S, f = S.version, p = i.toneMapping), c.layers.enableAll(), b.unshift(c, c.geometry, c.material, 0, 0, null));
    }
    function u(b, E) {
      b.getRGB(Rs, qc(i)), n.buffers.color.setClear(Rs.r, Rs.g, Rs.b, E, a);
    }
    return {
      getClearColor: function() {
        return o;
      },
      setClearColor: function(b, E = 1) {
        o.set(b), l = E, u(o, l);
      },
      getClearAlpha: function() {
        return l;
      },
      setClearAlpha: function(b) {
        l = b, u(o, l);
      },
      render: v,
      addToRenderList: m
    };
  }
  function Hm(i, t) {
    const e = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, s = f(null);
    let r = s, a = false;
    function o(x, C, k, z, V) {
      let Z = false;
      const W = d(z, k, C);
      r !== W && (r = W, c(r.object)), Z = p(x, z, k, V), Z && g(x, z, k, V), V !== null && t.update(V, i.ELEMENT_ARRAY_BUFFER), (Z || a) && (a = false, S(x, C, k, z), V !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(V).buffer));
    }
    function l() {
      return i.createVertexArray();
    }
    function c(x) {
      return i.bindVertexArray(x);
    }
    function h(x) {
      return i.deleteVertexArray(x);
    }
    function d(x, C, k) {
      const z = k.wireframe === true;
      let V = n[x.id];
      V === void 0 && (V = {}, n[x.id] = V);
      let Z = V[C.id];
      Z === void 0 && (Z = {}, V[C.id] = Z);
      let W = Z[z];
      return W === void 0 && (W = f(l()), Z[z] = W), W;
    }
    function f(x) {
      const C = [], k = [], z = [];
      for (let V = 0; V < e; V++) C[V] = 0, k[V] = 0, z[V] = 0;
      return {
        geometry: null,
        program: null,
        wireframe: false,
        newAttributes: C,
        enabledAttributes: k,
        attributeDivisors: z,
        object: x,
        attributes: {},
        index: null
      };
    }
    function p(x, C, k, z) {
      const V = r.attributes, Z = C.attributes;
      let W = 0;
      const tt = k.getAttributes();
      for (const G in tt) if (tt[G].location >= 0) {
        const ht = V[G];
        let St = Z[G];
        if (St === void 0 && (G === "instanceMatrix" && x.instanceMatrix && (St = x.instanceMatrix), G === "instanceColor" && x.instanceColor && (St = x.instanceColor)), ht === void 0 || ht.attribute !== St || St && ht.data !== St.data) return true;
        W++;
      }
      return r.attributesNum !== W || r.index !== z;
    }
    function g(x, C, k, z) {
      const V = {}, Z = C.attributes;
      let W = 0;
      const tt = k.getAttributes();
      for (const G in tt) if (tt[G].location >= 0) {
        let ht = Z[G];
        ht === void 0 && (G === "instanceMatrix" && x.instanceMatrix && (ht = x.instanceMatrix), G === "instanceColor" && x.instanceColor && (ht = x.instanceColor));
        const St = {};
        St.attribute = ht, ht && ht.data && (St.data = ht.data), V[G] = St, W++;
      }
      r.attributes = V, r.attributesNum = W, r.index = z;
    }
    function v() {
      const x = r.newAttributes;
      for (let C = 0, k = x.length; C < k; C++) x[C] = 0;
    }
    function m(x) {
      u(x, 0);
    }
    function u(x, C) {
      const k = r.newAttributes, z = r.enabledAttributes, V = r.attributeDivisors;
      k[x] = 1, z[x] === 0 && (i.enableVertexAttribArray(x), z[x] = 1), V[x] !== C && (i.vertexAttribDivisor(x, C), V[x] = C);
    }
    function b() {
      const x = r.newAttributes, C = r.enabledAttributes;
      for (let k = 0, z = C.length; k < z; k++) C[k] !== x[k] && (i.disableVertexAttribArray(k), C[k] = 0);
    }
    function E(x, C, k, z, V, Z, W) {
      W === true ? i.vertexAttribIPointer(x, C, k, V, Z) : i.vertexAttribPointer(x, C, k, z, V, Z);
    }
    function S(x, C, k, z) {
      v();
      const V = z.attributes, Z = k.getAttributes(), W = C.defaultAttributeValues;
      for (const tt in Z) {
        const G = Z[tt];
        if (G.location >= 0) {
          let st = V[tt];
          if (st === void 0 && (tt === "instanceMatrix" && x.instanceMatrix && (st = x.instanceMatrix), tt === "instanceColor" && x.instanceColor && (st = x.instanceColor)), st !== void 0) {
            const ht = st.normalized, St = st.itemSize, Ot = t.get(st);
            if (Ot === void 0) continue;
            const Qt = Ot.buffer, Y = Ot.type, et = Ot.bytesPerElement, vt = Y === i.INT || Y === i.UNSIGNED_INT || st.gpuType === za;
            if (st.isInterleavedBufferAttribute) {
              const rt = st.data, At = rt.stride, Dt = st.offset;
              if (rt.isInstancedInterleavedBuffer) {
                for (let Bt = 0; Bt < G.locationSize; Bt++) u(G.location + Bt, rt.meshPerAttribute);
                x.isInstancedMesh !== true && z._maxInstanceCount === void 0 && (z._maxInstanceCount = rt.meshPerAttribute * rt.count);
              } else for (let Bt = 0; Bt < G.locationSize; Bt++) m(G.location + Bt);
              i.bindBuffer(i.ARRAY_BUFFER, Qt);
              for (let Bt = 0; Bt < G.locationSize; Bt++) E(G.location + Bt, St / G.locationSize, Y, ht, At * et, (Dt + St / G.locationSize * Bt) * et, vt);
            } else {
              if (st.isInstancedBufferAttribute) {
                for (let rt = 0; rt < G.locationSize; rt++) u(G.location + rt, st.meshPerAttribute);
                x.isInstancedMesh !== true && z._maxInstanceCount === void 0 && (z._maxInstanceCount = st.meshPerAttribute * st.count);
              } else for (let rt = 0; rt < G.locationSize; rt++) m(G.location + rt);
              i.bindBuffer(i.ARRAY_BUFFER, Qt);
              for (let rt = 0; rt < G.locationSize; rt++) E(G.location + rt, St / G.locationSize, Y, ht, St * et, St / G.locationSize * rt * et, vt);
            }
          } else if (W !== void 0) {
            const ht = W[tt];
            if (ht !== void 0) switch (ht.length) {
              case 2:
                i.vertexAttrib2fv(G.location, ht);
                break;
              case 3:
                i.vertexAttrib3fv(G.location, ht);
                break;
              case 4:
                i.vertexAttrib4fv(G.location, ht);
                break;
              default:
                i.vertexAttrib1fv(G.location, ht);
            }
          }
        }
      }
      b();
    }
    function N() {
      P();
      for (const x in n) {
        const C = n[x];
        for (const k in C) {
          const z = C[k];
          for (const V in z) h(z[V].object), delete z[V];
          delete C[k];
        }
        delete n[x];
      }
    }
    function A(x) {
      if (n[x.id] === void 0) return;
      const C = n[x.id];
      for (const k in C) {
        const z = C[k];
        for (const V in z) h(z[V].object), delete z[V];
        delete C[k];
      }
      delete n[x.id];
    }
    function w(x) {
      for (const C in n) {
        const k = n[C];
        if (k[x.id] === void 0) continue;
        const z = k[x.id];
        for (const V in z) h(z[V].object), delete z[V];
        delete k[x.id];
      }
    }
    function P() {
      y(), a = true, r !== s && (r = s, c(r.object));
    }
    function y() {
      s.geometry = null, s.program = null, s.wireframe = false;
    }
    return {
      setup: o,
      reset: P,
      resetDefaultState: y,
      dispose: N,
      releaseStatesOfGeometry: A,
      releaseStatesOfProgram: w,
      initAttributes: v,
      enableAttribute: m,
      disableUnusedAttributes: b
    };
  }
  function Gm(i, t, e) {
    let n;
    function s(c) {
      n = c;
    }
    function r(c, h) {
      i.drawArrays(n, c, h), e.update(h, n, 1);
    }
    function a(c, h, d) {
      d !== 0 && (i.drawArraysInstanced(n, c, h, d), e.update(h, n, d));
    }
    function o(c, h, d) {
      if (d === 0) return;
      t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, c, 0, h, 0, d);
      let p = 0;
      for (let g = 0; g < d; g++) p += h[g];
      e.update(p, n, 1);
    }
    function l(c, h, d, f) {
      if (d === 0) return;
      const p = t.get("WEBGL_multi_draw");
      if (p === null) for (let g = 0; g < c.length; g++) a(c[g], h[g], f[g]);
      else {
        p.multiDrawArraysInstancedWEBGL(n, c, 0, h, 0, f, 0, d);
        let g = 0;
        for (let v = 0; v < d; v++) g += h[v] * f[v];
        e.update(g, n, 1);
      }
    }
    this.setMode = s, this.render = r, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
  }
  function Vm(i, t, e, n) {
    let s;
    function r() {
      if (s !== void 0) return s;
      if (t.has("EXT_texture_filter_anisotropic") === true) {
        const w = t.get("EXT_texture_filter_anisotropic");
        s = i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      } else s = 0;
      return s;
    }
    function a(w) {
      return !(w !== je && n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
    }
    function o(w) {
      const P = w === pn && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
      return !(w !== gn && n.convert(w) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && w !== tn && !P);
    }
    function l(w) {
      if (w === "highp") {
        if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0) return "highp";
        w = "mediump";
      }
      return w === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
    }
    let c = e.precision !== void 0 ? e.precision : "highp";
    const h = l(c);
    h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
    const d = e.logarithmicDepthBuffer === true, f = e.reverseDepthBuffer === true && t.has("EXT_clip_control"), p = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), g = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), v = i.getParameter(i.MAX_TEXTURE_SIZE), m = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), u = i.getParameter(i.MAX_VERTEX_ATTRIBS), b = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), E = i.getParameter(i.MAX_VARYING_VECTORS), S = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), N = g > 0, A = i.getParameter(i.MAX_SAMPLES);
    return {
      isWebGL2: true,
      getMaxAnisotropy: r,
      getMaxPrecision: l,
      textureFormatReadable: a,
      textureTypeReadable: o,
      precision: c,
      logarithmicDepthBuffer: d,
      reverseDepthBuffer: f,
      maxTextures: p,
      maxVertexTextures: g,
      maxTextureSize: v,
      maxCubemapSize: m,
      maxAttributes: u,
      maxVertexUniforms: b,
      maxVaryings: E,
      maxFragmentUniforms: S,
      vertexTextures: N,
      maxSamples: A
    };
  }
  function Wm(i) {
    const t = this;
    let e = null, n = 0, s = false, r = false;
    const a = new Tn(), o = new Ut(), l = {
      value: null,
      needsUpdate: false
    };
    this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(d, f) {
      const p = d.length !== 0 || f || n !== 0 || s;
      return s = f, n = d.length, p;
    }, this.beginShadows = function() {
      r = true, h(null);
    }, this.endShadows = function() {
      r = false;
    }, this.setGlobalState = function(d, f) {
      e = h(d, f, 0);
    }, this.setState = function(d, f, p) {
      const g = d.clippingPlanes, v = d.clipIntersection, m = d.clipShadows, u = i.get(d);
      if (!s || g === null || g.length === 0 || r && !m) r ? h(null) : c();
      else {
        const b = r ? 0 : n, E = b * 4;
        let S = u.clippingState || null;
        l.value = S, S = h(g, f, E, p);
        for (let N = 0; N !== E; ++N) S[N] = e[N];
        u.clippingState = S, this.numIntersection = v ? this.numPlanes : 0, this.numPlanes += b;
      }
    };
    function c() {
      l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
    }
    function h(d, f, p, g) {
      const v = d !== null ? d.length : 0;
      let m = null;
      if (v !== 0) {
        if (m = l.value, g !== true || m === null) {
          const u = p + v * 4, b = f.matrixWorldInverse;
          o.getNormalMatrix(b), (m === null || m.length < u) && (m = new Float32Array(u));
          for (let E = 0, S = p; E !== v; ++E, S += 4) a.copy(d[E]).applyMatrix4(b, o), a.normal.toArray(m, S), m[S + 3] = a.constant;
        }
        l.value = m, l.needsUpdate = true;
      }
      return t.numPlanes = v, t.numIntersection = 0, m;
    }
  }
  function Xm(i) {
    let t = /* @__PURE__ */ new WeakMap();
    function e(a, o) {
      return o === Qr ? a.mapping = Ai : o === ta && (a.mapping = wi), a;
    }
    function n(a) {
      if (a && a.isTexture) {
        const o = a.mapping;
        if (o === Qr || o === ta) if (t.has(a)) {
          const l = t.get(a).texture;
          return e(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new ef(l.height);
            return c.fromEquirectangularTexture(i, a), t.set(a, c), a.addEventListener("dispose", s), e(c.texture, a.mapping);
          } else return null;
        }
      }
      return a;
    }
    function s(a) {
      const o = a.target;
      o.removeEventListener("dispose", s);
      const l = t.get(o);
      l !== void 0 && (t.delete(o), l.dispose());
    }
    function r() {
      t = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: n,
      dispose: r
    };
  }
  class Zc extends Yc {
    constructor(t = -1, e = 1, n = 1, s = -1, r = 0.1, a = 2e3) {
      super(), this.isOrthographicCamera = true, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = t, this.right = e, this.top = n, this.bottom = s, this.near = r, this.far = a, this.updateProjectionMatrix();
    }
    copy(t, e) {
      return super.copy(t, e), this.left = t.left, this.right = t.right, this.top = t.top, this.bottom = t.bottom, this.near = t.near, this.far = t.far, this.zoom = t.zoom, this.view = t.view === null ? null : Object.assign({}, t.view), this;
    }
    setViewOffset(t, e, n, s, r, a) {
      this.view === null && (this.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      }), this.view.enabled = true, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = n, this.view.offsetY = s, this.view.width = r, this.view.height = a, this.updateProjectionMatrix();
    }
    clearViewOffset() {
      this.view !== null && (this.view.enabled = false), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const t = (this.right - this.left) / (2 * this.zoom), e = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, s = (this.top + this.bottom) / 2;
      let r = n - t, a = n + t, o = s + e, l = s - e;
      if (this.view !== null && this.view.enabled) {
        const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
        r += c * this.view.offsetX, a = r + c * this.view.width, o -= h * this.view.offsetY, l = o - h * this.view.height;
      }
      this.projectionMatrix.makeOrthographic(r, a, o, l, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, e.object.far = this.far, this.view !== null && (e.object.view = Object.assign({}, this.view)), e;
    }
  }
  const _i = 4, al = [
    0.125,
    0.215,
    0.35,
    0.446,
    0.526,
    0.582
  ], kn = 20, wr = new Zc(), ol = new Pt();
  let Cr = null, Rr = 0, Pr = 0, Dr = false;
  const Bn = (1 + Math.sqrt(5)) / 2, di = 1 / Bn, ll = [
    new R(-Bn, di, 0),
    new R(Bn, di, 0),
    new R(-di, 0, Bn),
    new R(di, 0, Bn),
    new R(0, Bn, -di),
    new R(0, Bn, di),
    new R(-1, 1, -1),
    new R(1, 1, -1),
    new R(-1, 1, 1),
    new R(1, 1, 1)
  ];
  class cl {
    constructor(t) {
      this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
    }
    fromScene(t, e = 0, n = 0.1, s = 100) {
      Cr = this._renderer.getRenderTarget(), Rr = this._renderer.getActiveCubeFace(), Pr = this._renderer.getActiveMipmapLevel(), Dr = this._renderer.xr.enabled, this._renderer.xr.enabled = false, this._setSize(256);
      const r = this._allocateTargets();
      return r.depthBuffer = true, this._sceneToCubeUV(t, n, s, r), e > 0 && this._blur(r, 0, 0, e), this._applyPMREM(r), this._cleanup(r), r;
    }
    fromEquirectangular(t, e = null) {
      return this._fromTexture(t, e);
    }
    fromCubemap(t, e = null) {
      return this._fromTexture(t, e);
    }
    compileCubemapShader() {
      this._cubemapMaterial === null && (this._cubemapMaterial = dl(), this._compileMaterial(this._cubemapMaterial));
    }
    compileEquirectangularShader() {
      this._equirectMaterial === null && (this._equirectMaterial = ul(), this._compileMaterial(this._equirectMaterial));
    }
    dispose() {
      this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
    }
    _setSize(t) {
      this._lodMax = Math.floor(Math.log2(t)), this._cubeSize = Math.pow(2, this._lodMax);
    }
    _dispose() {
      this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
      for (let t = 0; t < this._lodPlanes.length; t++) this._lodPlanes[t].dispose();
    }
    _cleanup(t) {
      this._renderer.setRenderTarget(Cr, Rr, Pr), this._renderer.xr.enabled = Dr, t.scissorTest = false, Ps(t, 0, 0, t.width, t.height);
    }
    _fromTexture(t, e) {
      t.mapping === Ai || t.mapping === wi ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), Cr = this._renderer.getRenderTarget(), Rr = this._renderer.getActiveCubeFace(), Pr = this._renderer.getActiveMipmapLevel(), Dr = this._renderer.xr.enabled, this._renderer.xr.enabled = false;
      const n = e || this._allocateTargets();
      return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
    }
    _allocateTargets() {
      const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = {
        magFilter: Qe,
        minFilter: Qe,
        generateMipmaps: false,
        type: pn,
        format: je,
        colorSpace: Ii,
        depthBuffer: false
      }, s = hl(t, e, n);
      if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
        this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = hl(t, e, n);
        const { _lodMax: r } = this;
        ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = qm(r)), this._blurMaterial = Ym(r, t, e);
      }
      return s;
    }
    _compileMaterial(t) {
      const e = new _e(this._lodPlanes[0], t);
      this._renderer.compile(e, wr);
    }
    _sceneToCubeUV(t, e, n, s) {
      const o = new De(90, 1, e, n), l = [
        1,
        -1,
        1,
        1,
        1,
        1
      ], c = [
        1,
        1,
        1,
        -1,
        -1,
        -1
      ], h = this._renderer, d = h.autoClear, f = h.toneMapping;
      h.getClearColor(ol), h.toneMapping = Rn, h.autoClear = false;
      const p = new ss({
        name: "PMREM.Background",
        side: Ie,
        depthWrite: false,
        depthTest: false
      }), g = new _e(new rs(), p);
      let v = false;
      const m = t.background;
      m ? m.isColor && (p.color.copy(m), t.background = null, v = true) : (p.color.copy(ol), v = true);
      for (let u = 0; u < 6; u++) {
        const b = u % 3;
        b === 0 ? (o.up.set(0, l[u], 0), o.lookAt(c[u], 0, 0)) : b === 1 ? (o.up.set(0, 0, l[u]), o.lookAt(0, c[u], 0)) : (o.up.set(0, l[u], 0), o.lookAt(0, 0, c[u]));
        const E = this._cubeSize;
        Ps(s, b * E, u > 2 ? E : 0, E, E), h.setRenderTarget(s), v && h.render(g, o), h.render(t, o);
      }
      g.geometry.dispose(), g.material.dispose(), h.toneMapping = f, h.autoClear = d, t.background = m;
    }
    _textureToCubeUV(t, e) {
      const n = this._renderer, s = t.mapping === Ai || t.mapping === wi;
      s ? (this._cubemapMaterial === null && (this._cubemapMaterial = dl()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === false ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = ul());
      const r = s ? this._cubemapMaterial : this._equirectMaterial, a = new _e(this._lodPlanes[0], r), o = r.uniforms;
      o.envMap.value = t;
      const l = this._cubeSize;
      Ps(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(a, wr);
    }
    _applyPMREM(t) {
      const e = this._renderer, n = e.autoClear;
      e.autoClear = false;
      const s = this._lodPlanes.length;
      for (let r = 1; r < s; r++) {
        const a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), o = ll[(s - r - 1) % ll.length];
        this._blur(t, r - 1, r, a, o);
      }
      e.autoClear = n;
    }
    _blur(t, e, n, s, r) {
      const a = this._pingPongRenderTarget;
      this._halfBlur(t, a, e, n, s, "latitudinal", r), this._halfBlur(a, t, n, n, s, "longitudinal", r);
    }
    _halfBlur(t, e, n, s, r, a, o) {
      const l = this._renderer, c = this._blurMaterial;
      a !== "latitudinal" && a !== "longitudinal" && console.error("blur direction must be either latitudinal or longitudinal!");
      const h = 3, d = new _e(this._lodPlanes[s], c), f = c.uniforms, p = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * p) : 2 * Math.PI / (2 * kn - 1), v = r / g, m = isFinite(r) ? 1 + Math.floor(h * v) : kn;
      m > kn && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${kn}`);
      const u = [];
      let b = 0;
      for (let w = 0; w < kn; ++w) {
        const P = w / v, y = Math.exp(-P * P / 2);
        u.push(y), w === 0 ? b += y : w < m && (b += 2 * y);
      }
      for (let w = 0; w < u.length; w++) u[w] = u[w] / b;
      f.envMap.value = t.texture, f.samples.value = m, f.weights.value = u, f.latitudinal.value = a === "latitudinal", o && (f.poleAxis.value = o);
      const { _lodMax: E } = this;
      f.dTheta.value = g, f.mipInt.value = E - n;
      const S = this._sizeLods[s], N = 3 * S * (s > E - _i ? s - E + _i : 0), A = 4 * (this._cubeSize - S);
      Ps(e, N, A, 3 * S, 2 * S), l.setRenderTarget(e), l.render(d, wr);
    }
  }
  function qm(i) {
    const t = [], e = [], n = [];
    let s = i;
    const r = i - _i + 1 + al.length;
    for (let a = 0; a < r; a++) {
      const o = Math.pow(2, s);
      e.push(o);
      let l = 1 / o;
      a > i - _i ? l = al[a - i + _i - 1] : a === 0 && (l = 0), n.push(l);
      const c = 1 / (o - 2), h = -c, d = 1 + c, f = [
        h,
        h,
        d,
        h,
        d,
        d,
        h,
        h,
        d,
        d,
        h,
        d
      ], p = 6, g = 6, v = 3, m = 2, u = 1, b = new Float32Array(v * g * p), E = new Float32Array(m * g * p), S = new Float32Array(u * g * p);
      for (let A = 0; A < p; A++) {
        const w = A % 3 * 2 / 3 - 1, P = A > 2 ? 0 : -1, y = [
          w,
          P,
          0,
          w + 2 / 3,
          P,
          0,
          w + 2 / 3,
          P + 1,
          0,
          w,
          P,
          0,
          w + 2 / 3,
          P + 1,
          0,
          w,
          P + 1,
          0
        ];
        b.set(y, v * g * A), E.set(f, m * g * A);
        const x = [
          A,
          A,
          A,
          A,
          A,
          A
        ];
        S.set(x, u * g * A);
      }
      const N = new be();
      N.setAttribute("position", new xe(b, v)), N.setAttribute("uv", new xe(E, m)), N.setAttribute("faceIndex", new xe(S, u)), t.push(N), s > _i && s--;
    }
    return {
      lodPlanes: t,
      sizeLods: e,
      sigmas: n
    };
  }
  function hl(i, t, e) {
    const n = new Ze(i, t, e);
    return n.texture.mapping = Js, n.texture.name = "PMREM.cubeUv", n.scissorTest = true, n;
  }
  function Ps(i, t, e, n, s) {
    i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s);
  }
  function Ym(i, t, e) {
    const n = new Float32Array(kn), s = new R(0, 1, 0);
    return new de({
      name: "SphericalGaussianBlur",
      defines: {
        n: kn,
        CUBEUV_TEXEL_WIDTH: 1 / t,
        CUBEUV_TEXEL_HEIGHT: 1 / e,
        CUBEUV_MAX_MIP: `${i}.0`
      },
      uniforms: {
        envMap: {
          value: null
        },
        samples: {
          value: 1
        },
        weights: {
          value: n
        },
        latitudinal: {
          value: false
        },
        dTheta: {
          value: 0
        },
        mipInt: {
          value: 0
        },
        poleAxis: {
          value: s
        }
      },
      vertexShader: Ka(),
      fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,
      blending: fn,
      depthTest: false,
      depthWrite: false
    });
  }
  function ul() {
    return new de({
      name: "EquirectangularToCubeUV",
      uniforms: {
        envMap: {
          value: null
        }
      },
      vertexShader: Ka(),
      fragmentShader: `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,
      blending: fn,
      depthTest: false,
      depthWrite: false
    });
  }
  function dl() {
    return new de({
      name: "CubemapToCubeUV",
      uniforms: {
        envMap: {
          value: null
        },
        flipEnvMap: {
          value: -1
        }
      },
      vertexShader: Ka(),
      fragmentShader: `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,
      blending: fn,
      depthTest: false,
      depthWrite: false
    });
  }
  function Ka() {
    return `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`;
  }
  function jm(i) {
    let t = /* @__PURE__ */ new WeakMap(), e = null;
    function n(o) {
      if (o && o.isTexture) {
        const l = o.mapping, c = l === Qr || l === ta, h = l === Ai || l === wi;
        if (c || h) {
          let d = t.get(o);
          const f = d !== void 0 ? d.texture.pmremVersion : 0;
          if (o.isRenderTargetTexture && o.pmremVersion !== f) return e === null && (e = new cl(i)), d = c ? e.fromEquirectangular(o, d) : e.fromCubemap(o, d), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), d.texture;
          if (d !== void 0) return d.texture;
          {
            const p = o.image;
            return c && p && p.height > 0 || h && p && s(p) ? (e === null && (e = new cl(i)), d = c ? e.fromEquirectangular(o) : e.fromCubemap(o), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), o.addEventListener("dispose", r), d.texture) : null;
          }
        }
      }
      return o;
    }
    function s(o) {
      let l = 0;
      const c = 6;
      for (let h = 0; h < c; h++) o[h] !== void 0 && l++;
      return l === c;
    }
    function r(o) {
      const l = o.target;
      l.removeEventListener("dispose", r);
      const c = t.get(l);
      c !== void 0 && (t.delete(l), c.dispose());
    }
    function a() {
      t = /* @__PURE__ */ new WeakMap(), e !== null && (e.dispose(), e = null);
    }
    return {
      get: n,
      dispose: a
    };
  }
  function Km(i) {
    const t = {};
    function e(n) {
      if (t[n] !== void 0) return t[n];
      let s;
      switch (n) {
        case "WEBGL_depth_texture":
          s = i.getExtension("WEBGL_depth_texture") || i.getExtension("MOZ_WEBGL_depth_texture") || i.getExtension("WEBKIT_WEBGL_depth_texture");
          break;
        case "EXT_texture_filter_anisotropic":
          s = i.getExtension("EXT_texture_filter_anisotropic") || i.getExtension("MOZ_EXT_texture_filter_anisotropic") || i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
          break;
        case "WEBGL_compressed_texture_s3tc":
          s = i.getExtension("WEBGL_compressed_texture_s3tc") || i.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
          break;
        case "WEBGL_compressed_texture_pvrtc":
          s = i.getExtension("WEBGL_compressed_texture_pvrtc") || i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
          break;
        default:
          s = i.getExtension(n);
      }
      return t[n] = s, s;
    }
    return {
      has: function(n) {
        return e(n) !== null;
      },
      init: function() {
        e("EXT_color_buffer_float"), e("WEBGL_clip_cull_distance"), e("OES_texture_float_linear"), e("EXT_color_buffer_half_float"), e("WEBGL_multisampled_render_to_texture"), e("WEBGL_render_shared_exponent");
      },
      get: function(n) {
        const s = e(n);
        return s === null && Zi("THREE.WebGLRenderer: " + n + " extension not supported."), s;
      }
    };
  }
  function Zm(i, t, e, n) {
    const s = {}, r = /* @__PURE__ */ new WeakMap();
    function a(d) {
      const f = d.target;
      f.index !== null && t.remove(f.index);
      for (const g in f.attributes) t.remove(f.attributes[g]);
      for (const g in f.morphAttributes) {
        const v = f.morphAttributes[g];
        for (let m = 0, u = v.length; m < u; m++) t.remove(v[m]);
      }
      f.removeEventListener("dispose", a), delete s[f.id];
      const p = r.get(f);
      p && (t.remove(p), r.delete(f)), n.releaseStatesOfGeometry(f), f.isInstancedBufferGeometry === true && delete f._maxInstanceCount, e.memory.geometries--;
    }
    function o(d, f) {
      return s[f.id] === true || (f.addEventListener("dispose", a), s[f.id] = true, e.memory.geometries++), f;
    }
    function l(d) {
      const f = d.attributes;
      for (const g in f) t.update(f[g], i.ARRAY_BUFFER);
      const p = d.morphAttributes;
      for (const g in p) {
        const v = p[g];
        for (let m = 0, u = v.length; m < u; m++) t.update(v[m], i.ARRAY_BUFFER);
      }
    }
    function c(d) {
      const f = [], p = d.index, g = d.attributes.position;
      let v = 0;
      if (p !== null) {
        const b = p.array;
        v = p.version;
        for (let E = 0, S = b.length; E < S; E += 3) {
          const N = b[E + 0], A = b[E + 1], w = b[E + 2];
          f.push(N, A, A, w, w, N);
        }
      } else if (g !== void 0) {
        const b = g.array;
        v = g.version;
        for (let E = 0, S = b.length / 3 - 1; E < S; E += 3) {
          const N = E + 0, A = E + 1, w = E + 2;
          f.push(N, A, A, w, w, N);
        }
      } else return;
      const m = new (kc(f) ? Xc : Wc)(f, 1);
      m.version = v;
      const u = r.get(d);
      u && t.remove(u), r.set(d, m);
    }
    function h(d) {
      const f = r.get(d);
      if (f) {
        const p = d.index;
        p !== null && f.version < p.version && c(d);
      } else c(d);
      return r.get(d);
    }
    return {
      get: o,
      update: l,
      getWireframeAttribute: h
    };
  }
  function $m(i, t, e) {
    let n;
    function s(f) {
      n = f;
    }
    let r, a;
    function o(f) {
      r = f.type, a = f.bytesPerElement;
    }
    function l(f, p) {
      i.drawElements(n, p, r, f * a), e.update(p, n, 1);
    }
    function c(f, p, g) {
      g !== 0 && (i.drawElementsInstanced(n, p, r, f * a, g), e.update(p, n, g));
    }
    function h(f, p, g) {
      if (g === 0) return;
      t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, p, 0, r, f, 0, g);
      let m = 0;
      for (let u = 0; u < g; u++) m += p[u];
      e.update(m, n, 1);
    }
    function d(f, p, g, v) {
      if (g === 0) return;
      const m = t.get("WEBGL_multi_draw");
      if (m === null) for (let u = 0; u < f.length; u++) c(f[u] / a, p[u], v[u]);
      else {
        m.multiDrawElementsInstancedWEBGL(n, p, 0, r, f, 0, v, 0, g);
        let u = 0;
        for (let b = 0; b < g; b++) u += p[b] * v[b];
        e.update(u, n, 1);
      }
    }
    this.setMode = s, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = d;
  }
  function Jm(i) {
    const t = {
      geometries: 0,
      textures: 0
    }, e = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };
    function n(r, a, o) {
      switch (e.calls++, a) {
        case i.TRIANGLES:
          e.triangles += o * (r / 3);
          break;
        case i.LINES:
          e.lines += o * (r / 2);
          break;
        case i.LINE_STRIP:
          e.lines += o * (r - 1);
          break;
        case i.LINE_LOOP:
          e.lines += o * r;
          break;
        case i.POINTS:
          e.points += o * r;
          break;
        default:
          console.error("THREE.WebGLInfo: Unknown draw mode:", a);
          break;
      }
    }
    function s() {
      e.calls = 0, e.triangles = 0, e.points = 0, e.lines = 0;
    }
    return {
      memory: t,
      render: e,
      programs: null,
      autoReset: true,
      reset: s,
      update: n
    };
  }
  function Qm(i, t, e) {
    const n = /* @__PURE__ */ new WeakMap(), s = new Jt();
    function r(a, o, l) {
      const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, d = h !== void 0 ? h.length : 0;
      let f = n.get(o);
      if (f === void 0 || f.count !== d) {
        let y = function() {
          w.dispose(), n.delete(o), o.removeEventListener("dispose", y);
        };
        f !== void 0 && f.texture.dispose();
        const p = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, v = o.morphAttributes.color !== void 0, m = o.morphAttributes.position || [], u = o.morphAttributes.normal || [], b = o.morphAttributes.color || [];
        let E = 0;
        p === true && (E = 1), g === true && (E = 2), v === true && (E = 3);
        let S = o.attributes.position.count * E, N = 1;
        S > t.maxTextureSize && (N = Math.ceil(S / t.maxTextureSize), S = t.maxTextureSize);
        const A = new Float32Array(S * N * 4 * d), w = new Gc(A, S, N, d);
        w.type = tn, w.needsUpdate = true;
        const P = E * 4;
        for (let x = 0; x < d; x++) {
          const C = m[x], k = u[x], z = b[x], V = S * N * 4 * x;
          for (let Z = 0; Z < C.count; Z++) {
            const W = Z * P;
            p === true && (s.fromBufferAttribute(C, Z), A[V + W + 0] = s.x, A[V + W + 1] = s.y, A[V + W + 2] = s.z, A[V + W + 3] = 0), g === true && (s.fromBufferAttribute(k, Z), A[V + W + 4] = s.x, A[V + W + 5] = s.y, A[V + W + 6] = s.z, A[V + W + 7] = 0), v === true && (s.fromBufferAttribute(z, Z), A[V + W + 8] = s.x, A[V + W + 9] = s.y, A[V + W + 10] = s.z, A[V + W + 11] = z.itemSize === 4 ? s.w : 1);
          }
        }
        f = {
          count: d,
          texture: w,
          size: new _t(S, N)
        }, n.set(o, f), o.addEventListener("dispose", y);
      }
      if (a.isInstancedMesh === true && a.morphTexture !== null) l.getUniforms().setValue(i, "morphTexture", a.morphTexture, e);
      else {
        let p = 0;
        for (let v = 0; v < c.length; v++) p += c[v];
        const g = o.morphTargetsRelative ? 1 : 1 - p;
        l.getUniforms().setValue(i, "morphTargetBaseInfluence", g), l.getUniforms().setValue(i, "morphTargetInfluences", c);
      }
      l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, e), l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size);
    }
    return {
      update: r
    };
  }
  function tg(i, t, e, n) {
    let s = /* @__PURE__ */ new WeakMap();
    function r(l) {
      const c = n.render.frame, h = l.geometry, d = t.get(l, h);
      if (s.get(d) !== c && (t.update(d), s.set(d, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === false && l.addEventListener("dispose", o), s.get(l) !== c && (e.update(l.instanceMatrix, i.ARRAY_BUFFER), l.instanceColor !== null && e.update(l.instanceColor, i.ARRAY_BUFFER), s.set(l, c))), l.isSkinnedMesh) {
        const f = l.skeleton;
        s.get(f) !== c && (f.update(), s.set(f, c));
      }
      return d;
    }
    function a() {
      s = /* @__PURE__ */ new WeakMap();
    }
    function o(l) {
      const c = l.target;
      c.removeEventListener("dispose", o), e.remove(c.instanceMatrix), c.instanceColor !== null && e.remove(c.instanceColor);
    }
    return {
      update: r,
      dispose: a
    };
  }
  class $c extends we {
    constructor(t, e, n, s, r, a, o, l, c, h = yi) {
      if (h !== yi && h !== Ri) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
      n === void 0 && h === yi && (n = Xn), n === void 0 && h === Ri && (n = Ci), super(null, s, r, a, o, l, h, n, c), this.isDepthTexture = true, this.image = {
        width: t,
        height: e
      }, this.magFilter = o !== void 0 ? o : Oe, this.minFilter = l !== void 0 ? l : Oe, this.flipY = false, this.generateMipmaps = false, this.compareFunction = null;
    }
    copy(t) {
      return super.copy(t), this.compareFunction = t.compareFunction, this;
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
    }
  }
  const Jc = new we(), fl = new $c(1, 1), Qc = new Gc(), th = new kd(), eh = new jc(), pl = [], ml = [], gl = new Float32Array(16), _l = new Float32Array(9), vl = new Float32Array(4);
  function Ni(i, t, e) {
    const n = i[0];
    if (n <= 0 || n > 0) return i;
    const s = t * e;
    let r = pl[s];
    if (r === void 0 && (r = new Float32Array(s), pl[s] = r), t !== 0) {
      n.toArray(r, 0);
      for (let a = 1, o = 0; a !== t; ++a) o += e, i[a].toArray(r, o);
    }
    return r;
  }
  function pe(i, t) {
    if (i.length !== t.length) return false;
    for (let e = 0, n = i.length; e < n; e++) if (i[e] !== t[e]) return false;
    return true;
  }
  function me(i, t) {
    for (let e = 0, n = t.length; e < n; e++) i[e] = t[e];
  }
  function tr(i, t) {
    let e = ml[t];
    e === void 0 && (e = new Int32Array(t), ml[t] = e);
    for (let n = 0; n !== t; ++n) e[n] = i.allocateTextureUnit();
    return e;
  }
  function eg(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t);
  }
  function ng(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
      if (pe(e, t)) return;
      i.uniform2fv(this.addr, t), me(e, t);
    }
  }
  function ig(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else if (t.r !== void 0) (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (i.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
    else {
      if (pe(e, t)) return;
      i.uniform3fv(this.addr, t), me(e, t);
    }
  }
  function sg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
      if (pe(e, t)) return;
      i.uniform4fv(this.addr, t), me(e, t);
    }
  }
  function rg(i, t) {
    const e = this.cache, n = t.elements;
    if (n === void 0) {
      if (pe(e, t)) return;
      i.uniformMatrix2fv(this.addr, false, t), me(e, t);
    } else {
      if (pe(e, n)) return;
      vl.set(n), i.uniformMatrix2fv(this.addr, false, vl), me(e, n);
    }
  }
  function ag(i, t) {
    const e = this.cache, n = t.elements;
    if (n === void 0) {
      if (pe(e, t)) return;
      i.uniformMatrix3fv(this.addr, false, t), me(e, t);
    } else {
      if (pe(e, n)) return;
      _l.set(n), i.uniformMatrix3fv(this.addr, false, _l), me(e, n);
    }
  }
  function og(i, t) {
    const e = this.cache, n = t.elements;
    if (n === void 0) {
      if (pe(e, t)) return;
      i.uniformMatrix4fv(this.addr, false, t), me(e, t);
    } else {
      if (pe(e, n)) return;
      gl.set(n), i.uniformMatrix4fv(this.addr, false, gl), me(e, n);
    }
  }
  function lg(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t);
  }
  function cg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
      if (pe(e, t)) return;
      i.uniform2iv(this.addr, t), me(e, t);
    }
  }
  function hg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else {
      if (pe(e, t)) return;
      i.uniform3iv(this.addr, t), me(e, t);
    }
  }
  function ug(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
      if (pe(e, t)) return;
      i.uniform4iv(this.addr, t), me(e, t);
    }
  }
  function dg(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t);
  }
  function fg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
      if (pe(e, t)) return;
      i.uniform2uiv(this.addr, t), me(e, t);
    }
  }
  function pg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else {
      if (pe(e, t)) return;
      i.uniform3uiv(this.addr, t), me(e, t);
    }
  }
  function mg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
      if (pe(e, t)) return;
      i.uniform4uiv(this.addr, t), me(e, t);
    }
  }
  function gg(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s);
    let r;
    this.type === i.SAMPLER_2D_SHADOW ? (fl.compareFunction = Bc, r = fl) : r = Jc, e.setTexture2D(t || r, s);
  }
  function _g(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture3D(t || th, s);
  }
  function vg(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTextureCube(t || eh, s);
  }
  function xg(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture2DArray(t || Qc, s);
  }
  function Mg(i) {
    switch (i) {
      case 5126:
        return eg;
      case 35664:
        return ng;
      case 35665:
        return ig;
      case 35666:
        return sg;
      case 35674:
        return rg;
      case 35675:
        return ag;
      case 35676:
        return og;
      case 5124:
      case 35670:
        return lg;
      case 35667:
      case 35671:
        return cg;
      case 35668:
      case 35672:
        return hg;
      case 35669:
      case 35673:
        return ug;
      case 5125:
        return dg;
      case 36294:
        return fg;
      case 36295:
        return pg;
      case 36296:
        return mg;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return gg;
      case 35679:
      case 36299:
      case 36307:
        return _g;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return vg;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return xg;
    }
  }
  function Sg(i, t) {
    i.uniform1fv(this.addr, t);
  }
  function yg(i, t) {
    const e = Ni(t, this.size, 2);
    i.uniform2fv(this.addr, e);
  }
  function Eg(i, t) {
    const e = Ni(t, this.size, 3);
    i.uniform3fv(this.addr, e);
  }
  function bg(i, t) {
    const e = Ni(t, this.size, 4);
    i.uniform4fv(this.addr, e);
  }
  function Tg(i, t) {
    const e = Ni(t, this.size, 4);
    i.uniformMatrix2fv(this.addr, false, e);
  }
  function Ag(i, t) {
    const e = Ni(t, this.size, 9);
    i.uniformMatrix3fv(this.addr, false, e);
  }
  function wg(i, t) {
    const e = Ni(t, this.size, 16);
    i.uniformMatrix4fv(this.addr, false, e);
  }
  function Cg(i, t) {
    i.uniform1iv(this.addr, t);
  }
  function Rg(i, t) {
    i.uniform2iv(this.addr, t);
  }
  function Pg(i, t) {
    i.uniform3iv(this.addr, t);
  }
  function Dg(i, t) {
    i.uniform4iv(this.addr, t);
  }
  function Ig(i, t) {
    i.uniform1uiv(this.addr, t);
  }
  function Lg(i, t) {
    i.uniform2uiv(this.addr, t);
  }
  function Ug(i, t) {
    i.uniform3uiv(this.addr, t);
  }
  function Ng(i, t) {
    i.uniform4uiv(this.addr, t);
  }
  function Fg(i, t, e) {
    const n = this.cache, s = t.length, r = tr(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture2D(t[a] || Jc, r[a]);
  }
  function Og(i, t, e) {
    const n = this.cache, s = t.length, r = tr(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture3D(t[a] || th, r[a]);
  }
  function Bg(i, t, e) {
    const n = this.cache, s = t.length, r = tr(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTextureCube(t[a] || eh, r[a]);
  }
  function zg(i, t, e) {
    const n = this.cache, s = t.length, r = tr(e, s);
    pe(n, r) || (i.uniform1iv(this.addr, r), me(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture2DArray(t[a] || Qc, r[a]);
  }
  function kg(i) {
    switch (i) {
      case 5126:
        return Sg;
      case 35664:
        return yg;
      case 35665:
        return Eg;
      case 35666:
        return bg;
      case 35674:
        return Tg;
      case 35675:
        return Ag;
      case 35676:
        return wg;
      case 5124:
      case 35670:
        return Cg;
      case 35667:
      case 35671:
        return Rg;
      case 35668:
      case 35672:
        return Pg;
      case 35669:
      case 35673:
        return Dg;
      case 5125:
        return Ig;
      case 36294:
        return Lg;
      case 36295:
        return Ug;
      case 36296:
        return Ng;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return Fg;
      case 35679:
      case 36299:
      case 36307:
        return Og;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return Bg;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return zg;
    }
  }
  class Hg {
    constructor(t, e, n) {
      this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = Mg(e.type);
    }
  }
  class Gg {
    constructor(t, e, n) {
      this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = kg(e.type);
    }
  }
  class Vg {
    constructor(t) {
      this.id = t, this.seq = [], this.map = {};
    }
    setValue(t, e, n) {
      const s = this.seq;
      for (let r = 0, a = s.length; r !== a; ++r) {
        const o = s[r];
        o.setValue(t, e[o.id], n);
      }
    }
  }
  const Ir = /(\w+)(\])?(\[|\.)?/g;
  function xl(i, t) {
    i.seq.push(t), i.map[t.id] = t;
  }
  function Wg(i, t, e) {
    const n = i.name, s = n.length;
    for (Ir.lastIndex = 0; ; ) {
      const r = Ir.exec(n), a = Ir.lastIndex;
      let o = r[1];
      const l = r[2] === "]", c = r[3];
      if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === s) {
        xl(e, c === void 0 ? new Hg(o, i, t) : new Gg(o, i, t));
        break;
      } else {
        let d = e.map[o];
        d === void 0 && (d = new Vg(o), xl(e, d)), e = d;
      }
    }
  }
  class Xs {
    constructor(t, e) {
      this.seq = [], this.map = {};
      const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
      for (let s = 0; s < n; ++s) {
        const r = t.getActiveUniform(e, s), a = t.getUniformLocation(e, r.name);
        Wg(r, a, this);
      }
    }
    setValue(t, e, n, s) {
      const r = this.map[e];
      r !== void 0 && r.setValue(t, n, s);
    }
    setOptional(t, e, n) {
      const s = e[n];
      s !== void 0 && this.setValue(t, n, s);
    }
    static upload(t, e, n, s) {
      for (let r = 0, a = e.length; r !== a; ++r) {
        const o = e[r], l = n[o.id];
        l.needsUpdate !== false && o.setValue(t, l.value, s);
      }
    }
    static seqWithValue(t, e) {
      const n = [];
      for (let s = 0, r = t.length; s !== r; ++s) {
        const a = t[s];
        a.id in e && n.push(a);
      }
      return n;
    }
  }
  function Ml(i, t, e) {
    const n = i.createShader(t);
    return i.shaderSource(n, e), i.compileShader(n), n;
  }
  const Xg = 37297;
  let qg = 0;
  function Yg(i, t) {
    const e = i.split(`
`), n = [], s = Math.max(t - 6, 0), r = Math.min(t + 6, e.length);
    for (let a = s; a < r; a++) {
      const o = a + 1;
      n.push(`${o === t ? ">" : " "} ${o}: ${e[a]}`);
    }
    return n.join(`
`);
  }
  const Sl = new Ut();
  function jg(i) {
    Gt._getMatrix(Sl, Gt.workingColorSpace, i);
    const t = `mat3( ${Sl.elements.map((e) => e.toFixed(4))} )`;
    switch (Gt.getTransfer(i)) {
      case Qs:
        return [
          t,
          "LinearTransferOETF"
        ];
      case Kt:
        return [
          t,
          "sRGBTransferOETF"
        ];
      default:
        return console.warn("THREE.WebGLProgram: Unsupported color space: ", i), [
          t,
          "LinearTransferOETF"
        ];
    }
  }
  function yl(i, t, e) {
    const n = i.getShaderParameter(t, i.COMPILE_STATUS), s = i.getShaderInfoLog(t).trim();
    if (n && s === "") return "";
    const r = /ERROR: 0:(\d+)/.exec(s);
    if (r) {
      const a = parseInt(r[1]);
      return e.toUpperCase() + `

` + s + `

` + Yg(i.getShaderSource(t), a);
    } else return s;
  }
  function Kg(i, t) {
    const e = jg(t);
    return [
      `vec4 ${i}( vec4 value ) {`,
      `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,
      "}"
    ].join(`
`);
  }
  function Zg(i, t) {
    let e;
    switch (t) {
      case yc:
        e = "Linear";
        break;
      case Ec:
        e = "Reinhard";
        break;
      case bc:
        e = "Cineon";
        break;
      case Ba:
        e = "ACESFilmic";
        break;
      case Tc:
        e = "AgX";
        break;
      case Ac:
        e = "Neutral";
        break;
      case sd:
        e = "Custom";
        break;
      default:
        console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
    }
    return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
  }
  const Ds = new R();
  function $g() {
    Gt.getLuminanceCoefficients(Ds);
    const i = Ds.x.toFixed(4), t = Ds.y.toFixed(4), e = Ds.z.toFixed(4);
    return [
      "float luminance( const in vec3 rgb ) {",
      `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
      "	return dot( weights, rgb );",
      "}"
    ].join(`
`);
  }
  function Jg(i) {
    return [
      i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
      i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
    ].filter($i).join(`
`);
  }
  function Qg(i) {
    const t = [];
    for (const e in i) {
      const n = i[e];
      n !== false && t.push("#define " + e + " " + n);
    }
    return t.join(`
`);
  }
  function t_(i, t) {
    const e = {}, n = i.getProgramParameter(t, i.ACTIVE_ATTRIBUTES);
    for (let s = 0; s < n; s++) {
      const r = i.getActiveAttrib(t, s), a = r.name;
      let o = 1;
      r.type === i.FLOAT_MAT2 && (o = 2), r.type === i.FLOAT_MAT3 && (o = 3), r.type === i.FLOAT_MAT4 && (o = 4), e[a] = {
        type: r.type,
        location: i.getAttribLocation(t, a),
        locationSize: o
      };
    }
    return e;
  }
  function $i(i) {
    return i !== "";
  }
  function El(i, t) {
    const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
    return i.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
  }
  function bl(i, t) {
    return i.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
  }
  const e_ = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function Ra(i) {
    return i.replace(e_, i_);
  }
  const n_ = /* @__PURE__ */ new Map();
  function i_(i, t) {
    let e = Ft[t];
    if (e === void 0) {
      const n = n_.get(t);
      if (n !== void 0) e = Ft[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
      else throw new Error("Can not resolve #include <" + t + ">");
    }
    return Ra(e);
  }
  const s_ = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
  function Tl(i) {
    return i.replace(s_, r_);
  }
  function r_(i, t, e, n) {
    let s = "";
    for (let r = parseInt(t); r < parseInt(e); r++) s += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
    return s;
  }
  function Al(i) {
    let t = `precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;
    return i.precision === "highp" ? t += `
#define HIGH_PRECISION` : i.precision === "mediump" ? t += `
#define MEDIUM_PRECISION` : i.precision === "lowp" && (t += `
#define LOW_PRECISION`), t;
  }
  function a_(i) {
    let t = "SHADOWMAP_TYPE_BASIC";
    return i.shadowMapType === Mc ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === Ou ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === un && (t = "SHADOWMAP_TYPE_VSM"), t;
  }
  function o_(i) {
    let t = "ENVMAP_TYPE_CUBE";
    if (i.envMap) switch (i.envMapMode) {
      case Ai:
      case wi:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case Js:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
    return t;
  }
  function l_(i) {
    let t = "ENVMAP_MODE_REFLECTION";
    if (i.envMap) switch (i.envMapMode) {
      case wi:
        t = "ENVMAP_MODE_REFRACTION";
        break;
    }
    return t;
  }
  function c_(i) {
    let t = "ENVMAP_BLENDING_NONE";
    if (i.envMap) switch (i.combine) {
      case Sc:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case nd:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case id:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
    return t;
  }
  function h_(i) {
    const t = i.envMapCubeUVHeight;
    if (t === null) return null;
    const e = Math.log2(t) - 2, n = 1 / t;
    return {
      texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 7 * 16)),
      texelHeight: n,
      maxMip: e
    };
  }
  function u_(i, t, e, n) {
    const s = i.getContext(), r = e.defines;
    let a = e.vertexShader, o = e.fragmentShader;
    const l = a_(e), c = o_(e), h = l_(e), d = c_(e), f = h_(e), p = Jg(e), g = Qg(r), v = s.createProgram();
    let m, u, b = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
    e.isRawShaderMaterial ? (m = [
      "#define SHADER_TYPE " + e.shaderType,
      "#define SHADER_NAME " + e.shaderName,
      g
    ].filter($i).join(`
`), m.length > 0 && (m += `
`), u = [
      "#define SHADER_TYPE " + e.shaderType,
      "#define SHADER_NAME " + e.shaderName,
      g
    ].filter($i).join(`
`), u.length > 0 && (u += `
`)) : (m = [
      Al(e),
      "#define SHADER_TYPE " + e.shaderType,
      "#define SHADER_NAME " + e.shaderName,
      g,
      e.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
      e.batching ? "#define USE_BATCHING" : "",
      e.batchingColor ? "#define USE_BATCHING_COLOR" : "",
      e.instancing ? "#define USE_INSTANCING" : "",
      e.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
      e.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
      e.useFog && e.fog ? "#define USE_FOG" : "",
      e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
      e.map ? "#define USE_MAP" : "",
      e.envMap ? "#define USE_ENVMAP" : "",
      e.envMap ? "#define " + h : "",
      e.lightMap ? "#define USE_LIGHTMAP" : "",
      e.aoMap ? "#define USE_AOMAP" : "",
      e.bumpMap ? "#define USE_BUMPMAP" : "",
      e.normalMap ? "#define USE_NORMALMAP" : "",
      e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
      e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
      e.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
      e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
      e.anisotropy ? "#define USE_ANISOTROPY" : "",
      e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
      e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
      e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
      e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
      e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
      e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
      e.specularMap ? "#define USE_SPECULARMAP" : "",
      e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
      e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
      e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
      e.metalnessMap ? "#define USE_METALNESSMAP" : "",
      e.alphaMap ? "#define USE_ALPHAMAP" : "",
      e.alphaHash ? "#define USE_ALPHAHASH" : "",
      e.transmission ? "#define USE_TRANSMISSION" : "",
      e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
      e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
      e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
      e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
      e.mapUv ? "#define MAP_UV " + e.mapUv : "",
      e.alphaMapUv ? "#define ALPHAMAP_UV " + e.alphaMapUv : "",
      e.lightMapUv ? "#define LIGHTMAP_UV " + e.lightMapUv : "",
      e.aoMapUv ? "#define AOMAP_UV " + e.aoMapUv : "",
      e.emissiveMapUv ? "#define EMISSIVEMAP_UV " + e.emissiveMapUv : "",
      e.bumpMapUv ? "#define BUMPMAP_UV " + e.bumpMapUv : "",
      e.normalMapUv ? "#define NORMALMAP_UV " + e.normalMapUv : "",
      e.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + e.displacementMapUv : "",
      e.metalnessMapUv ? "#define METALNESSMAP_UV " + e.metalnessMapUv : "",
      e.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + e.roughnessMapUv : "",
      e.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + e.anisotropyMapUv : "",
      e.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + e.clearcoatMapUv : "",
      e.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + e.clearcoatNormalMapUv : "",
      e.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + e.clearcoatRoughnessMapUv : "",
      e.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + e.iridescenceMapUv : "",
      e.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + e.iridescenceThicknessMapUv : "",
      e.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + e.sheenColorMapUv : "",
      e.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + e.sheenRoughnessMapUv : "",
      e.specularMapUv ? "#define SPECULARMAP_UV " + e.specularMapUv : "",
      e.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + e.specularColorMapUv : "",
      e.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + e.specularIntensityMapUv : "",
      e.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + e.transmissionMapUv : "",
      e.thicknessMapUv ? "#define THICKNESSMAP_UV " + e.thicknessMapUv : "",
      e.vertexTangents && e.flatShading === false ? "#define USE_TANGENT" : "",
      e.vertexColors ? "#define USE_COLOR" : "",
      e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
      e.vertexUv1s ? "#define USE_UV1" : "",
      e.vertexUv2s ? "#define USE_UV2" : "",
      e.vertexUv3s ? "#define USE_UV3" : "",
      e.pointsUvs ? "#define USE_POINTS_UV" : "",
      e.flatShading ? "#define FLAT_SHADED" : "",
      e.skinning ? "#define USE_SKINNING" : "",
      e.morphTargets ? "#define USE_MORPHTARGETS" : "",
      e.morphNormals && e.flatShading === false ? "#define USE_MORPHNORMALS" : "",
      e.morphColors ? "#define USE_MORPHCOLORS" : "",
      e.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + e.morphTextureStride : "",
      e.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + e.morphTargetsCount : "",
      e.doubleSided ? "#define DOUBLE_SIDED" : "",
      e.flipSided ? "#define FLIP_SIDED" : "",
      e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
      e.shadowMapEnabled ? "#define " + l : "",
      e.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
      e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
      e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
      e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
      "uniform mat4 modelMatrix;",
      "uniform mat4 modelViewMatrix;",
      "uniform mat4 projectionMatrix;",
      "uniform mat4 viewMatrix;",
      "uniform mat3 normalMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      "#ifdef USE_INSTANCING",
      "	attribute mat4 instanceMatrix;",
      "#endif",
      "#ifdef USE_INSTANCING_COLOR",
      "	attribute vec3 instanceColor;",
      "#endif",
      "#ifdef USE_INSTANCING_MORPH",
      "	uniform sampler2D morphTexture;",
      "#endif",
      "attribute vec3 position;",
      "attribute vec3 normal;",
      "attribute vec2 uv;",
      "#ifdef USE_UV1",
      "	attribute vec2 uv1;",
      "#endif",
      "#ifdef USE_UV2",
      "	attribute vec2 uv2;",
      "#endif",
      "#ifdef USE_UV3",
      "	attribute vec2 uv3;",
      "#endif",
      "#ifdef USE_TANGENT",
      "	attribute vec4 tangent;",
      "#endif",
      "#if defined( USE_COLOR_ALPHA )",
      "	attribute vec4 color;",
      "#elif defined( USE_COLOR )",
      "	attribute vec3 color;",
      "#endif",
      "#ifdef USE_SKINNING",
      "	attribute vec4 skinIndex;",
      "	attribute vec4 skinWeight;",
      "#endif",
      `
`
    ].filter($i).join(`
`), u = [
      Al(e),
      "#define SHADER_TYPE " + e.shaderType,
      "#define SHADER_NAME " + e.shaderName,
      g,
      e.useFog && e.fog ? "#define USE_FOG" : "",
      e.useFog && e.fogExp2 ? "#define FOG_EXP2" : "",
      e.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
      e.map ? "#define USE_MAP" : "",
      e.matcap ? "#define USE_MATCAP" : "",
      e.envMap ? "#define USE_ENVMAP" : "",
      e.envMap ? "#define " + c : "",
      e.envMap ? "#define " + h : "",
      e.envMap ? "#define " + d : "",
      f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
      f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
      f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
      e.lightMap ? "#define USE_LIGHTMAP" : "",
      e.aoMap ? "#define USE_AOMAP" : "",
      e.bumpMap ? "#define USE_BUMPMAP" : "",
      e.normalMap ? "#define USE_NORMALMAP" : "",
      e.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
      e.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
      e.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
      e.anisotropy ? "#define USE_ANISOTROPY" : "",
      e.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
      e.clearcoat ? "#define USE_CLEARCOAT" : "",
      e.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
      e.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
      e.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
      e.dispersion ? "#define USE_DISPERSION" : "",
      e.iridescence ? "#define USE_IRIDESCENCE" : "",
      e.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
      e.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
      e.specularMap ? "#define USE_SPECULARMAP" : "",
      e.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
      e.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
      e.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
      e.metalnessMap ? "#define USE_METALNESSMAP" : "",
      e.alphaMap ? "#define USE_ALPHAMAP" : "",
      e.alphaTest ? "#define USE_ALPHATEST" : "",
      e.alphaHash ? "#define USE_ALPHAHASH" : "",
      e.sheen ? "#define USE_SHEEN" : "",
      e.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
      e.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
      e.transmission ? "#define USE_TRANSMISSION" : "",
      e.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
      e.thicknessMap ? "#define USE_THICKNESSMAP" : "",
      e.vertexTangents && e.flatShading === false ? "#define USE_TANGENT" : "",
      e.vertexColors || e.instancingColor || e.batchingColor ? "#define USE_COLOR" : "",
      e.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
      e.vertexUv1s ? "#define USE_UV1" : "",
      e.vertexUv2s ? "#define USE_UV2" : "",
      e.vertexUv3s ? "#define USE_UV3" : "",
      e.pointsUvs ? "#define USE_POINTS_UV" : "",
      e.gradientMap ? "#define USE_GRADIENTMAP" : "",
      e.flatShading ? "#define FLAT_SHADED" : "",
      e.doubleSided ? "#define DOUBLE_SIDED" : "",
      e.flipSided ? "#define FLIP_SIDED" : "",
      e.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
      e.shadowMapEnabled ? "#define " + l : "",
      e.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
      e.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
      e.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
      e.decodeVideoTextureEmissive ? "#define DECODE_VIDEO_TEXTURE_EMISSIVE" : "",
      e.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
      e.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
      "uniform mat4 viewMatrix;",
      "uniform vec3 cameraPosition;",
      "uniform bool isOrthographic;",
      e.toneMapping !== Rn ? "#define TONE_MAPPING" : "",
      e.toneMapping !== Rn ? Ft.tonemapping_pars_fragment : "",
      e.toneMapping !== Rn ? Zg("toneMapping", e.toneMapping) : "",
      e.dithering ? "#define DITHERING" : "",
      e.opaque ? "#define OPAQUE" : "",
      Ft.colorspace_pars_fragment,
      Kg("linearToOutputTexel", e.outputColorSpace),
      $g(),
      e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
      `
`
    ].filter($i).join(`
`)), a = Ra(a), a = El(a, e), a = bl(a, e), o = Ra(o), o = El(o, e), o = bl(o, e), a = Tl(a), o = Tl(o), e.isRawShaderMaterial !== true && (b = `#version 300 es
`, m = [
      p,
      "#define attribute in",
      "#define varying out",
      "#define texture2D texture"
    ].join(`
`) + `
` + m, u = [
      "#define varying in",
      e.glslVersion === Bo ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
      e.glslVersion === Bo ? "" : "#define gl_FragColor pc_fragColor",
      "#define gl_FragDepthEXT gl_FragDepth",
      "#define texture2D texture",
      "#define textureCube texture",
      "#define texture2DProj textureProj",
      "#define texture2DLodEXT textureLod",
      "#define texture2DProjLodEXT textureProjLod",
      "#define textureCubeLodEXT textureLod",
      "#define texture2DGradEXT textureGrad",
      "#define texture2DProjGradEXT textureProjGrad",
      "#define textureCubeGradEXT textureGrad"
    ].join(`
`) + `
` + u);
    const E = b + m + a, S = b + u + o, N = Ml(s, s.VERTEX_SHADER, E), A = Ml(s, s.FRAGMENT_SHADER, S);
    s.attachShader(v, N), s.attachShader(v, A), e.index0AttributeName !== void 0 ? s.bindAttribLocation(v, 0, e.index0AttributeName) : e.morphTargets === true && s.bindAttribLocation(v, 0, "position"), s.linkProgram(v);
    function w(C) {
      if (i.debug.checkShaderErrors) {
        const k = s.getProgramInfoLog(v).trim(), z = s.getShaderInfoLog(N).trim(), V = s.getShaderInfoLog(A).trim();
        let Z = true, W = true;
        if (s.getProgramParameter(v, s.LINK_STATUS) === false) if (Z = false, typeof i.debug.onShaderError == "function") i.debug.onShaderError(s, v, N, A);
        else {
          const tt = yl(s, N, "vertex"), G = yl(s, A, "fragment");
          console.error("THREE.WebGLProgram: Shader Error " + s.getError() + " - VALIDATE_STATUS " + s.getProgramParameter(v, s.VALIDATE_STATUS) + `

Material Name: ` + C.name + `
Material Type: ` + C.type + `

Program Info Log: ` + k + `
` + tt + `
` + G);
        }
        else k !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", k) : (z === "" || V === "") && (W = false);
        W && (C.diagnostics = {
          runnable: Z,
          programLog: k,
          vertexShader: {
            log: z,
            prefix: m
          },
          fragmentShader: {
            log: V,
            prefix: u
          }
        });
      }
      s.deleteShader(N), s.deleteShader(A), P = new Xs(s, v), y = t_(s, v);
    }
    let P;
    this.getUniforms = function() {
      return P === void 0 && w(this), P;
    };
    let y;
    this.getAttributes = function() {
      return y === void 0 && w(this), y;
    };
    let x = e.rendererExtensionParallelShaderCompile === false;
    return this.isReady = function() {
      return x === false && (x = s.getProgramParameter(v, Xg)), x;
    }, this.destroy = function() {
      n.releaseStatesOfProgram(this), s.deleteProgram(v), this.program = void 0;
    }, this.type = e.shaderType, this.name = e.shaderName, this.id = qg++, this.cacheKey = t, this.usedTimes = 1, this.program = v, this.vertexShader = N, this.fragmentShader = A, this;
  }
  let d_ = 0;
  class f_ {
    constructor() {
      this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
    }
    update(t) {
      const e = t.vertexShader, n = t.fragmentShader, s = this._getShaderStage(e), r = this._getShaderStage(n), a = this._getShaderCacheForMaterial(t);
      return a.has(s) === false && (a.add(s), s.usedTimes++), a.has(r) === false && (a.add(r), r.usedTimes++), this;
    }
    remove(t) {
      const e = this.materialCache.get(t);
      for (const n of e) n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
      return this.materialCache.delete(t), this;
    }
    getVertexShaderID(t) {
      return this._getShaderStage(t.vertexShader).id;
    }
    getFragmentShaderID(t) {
      return this._getShaderStage(t.fragmentShader).id;
    }
    dispose() {
      this.shaderCache.clear(), this.materialCache.clear();
    }
    _getShaderCacheForMaterial(t) {
      const e = this.materialCache;
      let n = e.get(t);
      return n === void 0 && (n = /* @__PURE__ */ new Set(), e.set(t, n)), n;
    }
    _getShaderStage(t) {
      const e = this.shaderCache;
      let n = e.get(t);
      return n === void 0 && (n = new p_(t), e.set(t, n)), n;
    }
  }
  class p_ {
    constructor(t) {
      this.id = d_++, this.code = t, this.usedTimes = 0;
    }
  }
  function m_(i, t, e, n, s, r, a) {
    const o = new Ya(), l = new f_(), c = /* @__PURE__ */ new Set(), h = [], d = s.logarithmicDepthBuffer, f = s.vertexTextures;
    let p = s.precision;
    const g = {
      MeshDepthMaterial: "depth",
      MeshDistanceMaterial: "distanceRGBA",
      MeshNormalMaterial: "normal",
      MeshBasicMaterial: "basic",
      MeshLambertMaterial: "lambert",
      MeshPhongMaterial: "phong",
      MeshToonMaterial: "toon",
      MeshStandardMaterial: "physical",
      MeshPhysicalMaterial: "physical",
      MeshMatcapMaterial: "matcap",
      LineBasicMaterial: "basic",
      LineDashedMaterial: "dashed",
      PointsMaterial: "points",
      ShadowMaterial: "shadow",
      SpriteMaterial: "sprite"
    };
    function v(y) {
      return c.add(y), y === 0 ? "uv" : `uv${y}`;
    }
    function m(y, x, C, k, z) {
      const V = k.fog, Z = z.geometry, W = y.isMeshStandardMaterial ? k.environment : null, tt = (y.isMeshStandardMaterial ? e : t).get(y.envMap || W), G = tt && tt.mapping === Js ? tt.image.height : null, st = g[y.type];
      y.precision !== null && (p = s.getMaxPrecision(y.precision), p !== y.precision && console.warn("THREE.WebGLProgram.getParameters:", y.precision, "not supported, using", p, "instead."));
      const ht = Z.morphAttributes.position || Z.morphAttributes.normal || Z.morphAttributes.color, St = ht !== void 0 ? ht.length : 0;
      let Ot = 0;
      Z.morphAttributes.position !== void 0 && (Ot = 1), Z.morphAttributes.normal !== void 0 && (Ot = 2), Z.morphAttributes.color !== void 0 && (Ot = 3);
      let Qt, Y, et, vt;
      if (st) {
        const jt = Je[st];
        Qt = jt.vertexShader, Y = jt.fragmentShader;
      } else Qt = y.vertexShader, Y = y.fragmentShader, l.update(y), et = l.getVertexShaderID(y), vt = l.getFragmentShaderID(y);
      const rt = i.getRenderTarget(), At = i.state.buffers.depth.getReversed(), Dt = z.isInstancedMesh === true, Bt = z.isBatchedMesh === true, re = !!y.map, Vt = !!y.matcap, le = !!tt, U = !!y.aoMap, Be = !!y.lightMap, zt = !!y.bumpMap, kt = !!y.normalMap, Et = !!y.displacementMap, ne = !!y.emissiveMap, yt = !!y.metalnessMap, T = !!y.roughnessMap, _ = y.anisotropy > 0, F = y.clearcoat > 0, j = y.dispersion > 0, $ = y.iridescence > 0, q = y.sheen > 0, xt = y.transmission > 0, at = _ && !!y.anisotropyMap, ut = F && !!y.clearcoatMap, Wt = F && !!y.clearcoatNormalMap, J = F && !!y.clearcoatRoughnessMap, dt = $ && !!y.iridescenceMap, bt = $ && !!y.iridescenceThicknessMap, Ct = q && !!y.sheenColorMap, ft = q && !!y.sheenRoughnessMap, Ht = !!y.specularMap, Nt = !!y.specularColorMap, te = !!y.specularIntensityMap, D = xt && !!y.transmissionMap, it = xt && !!y.thicknessMap, H = !!y.gradientMap, K = !!y.alphaMap, ct = y.alphaTest > 0, ot = !!y.alphaHash, It = !!y.extensions;
      let ae = Rn;
      y.toneMapped && (rt === null || rt.isXRRenderTarget === true) && (ae = i.toneMapping);
      const Me = {
        shaderID: st,
        shaderType: y.type,
        shaderName: y.name,
        vertexShader: Qt,
        fragmentShader: Y,
        defines: y.defines,
        customVertexShaderID: et,
        customFragmentShaderID: vt,
        isRawShaderMaterial: y.isRawShaderMaterial === true,
        glslVersion: y.glslVersion,
        precision: p,
        batching: Bt,
        batchingColor: Bt && z._colorsTexture !== null,
        instancing: Dt,
        instancingColor: Dt && z.instanceColor !== null,
        instancingMorph: Dt && z.morphTexture !== null,
        supportsVertexTextures: f,
        outputColorSpace: rt === null ? i.outputColorSpace : rt.isXRRenderTarget === true ? rt.texture.colorSpace : Ii,
        alphaToCoverage: !!y.alphaToCoverage,
        map: re,
        matcap: Vt,
        envMap: le,
        envMapMode: le && tt.mapping,
        envMapCubeUVHeight: G,
        aoMap: U,
        lightMap: Be,
        bumpMap: zt,
        normalMap: kt,
        displacementMap: f && Et,
        emissiveMap: ne,
        normalMapObjectSpace: kt && y.normalMapType === ld,
        normalMapTangentSpace: kt && y.normalMapType === Oc,
        metalnessMap: yt,
        roughnessMap: T,
        anisotropy: _,
        anisotropyMap: at,
        clearcoat: F,
        clearcoatMap: ut,
        clearcoatNormalMap: Wt,
        clearcoatRoughnessMap: J,
        dispersion: j,
        iridescence: $,
        iridescenceMap: dt,
        iridescenceThicknessMap: bt,
        sheen: q,
        sheenColorMap: Ct,
        sheenRoughnessMap: ft,
        specularMap: Ht,
        specularColorMap: Nt,
        specularIntensityMap: te,
        transmission: xt,
        transmissionMap: D,
        thicknessMap: it,
        gradientMap: H,
        opaque: y.transparent === false && y.blending === Si && y.alphaToCoverage === false,
        alphaMap: K,
        alphaTest: ct,
        alphaHash: ot,
        combine: y.combine,
        mapUv: re && v(y.map.channel),
        aoMapUv: U && v(y.aoMap.channel),
        lightMapUv: Be && v(y.lightMap.channel),
        bumpMapUv: zt && v(y.bumpMap.channel),
        normalMapUv: kt && v(y.normalMap.channel),
        displacementMapUv: Et && v(y.displacementMap.channel),
        emissiveMapUv: ne && v(y.emissiveMap.channel),
        metalnessMapUv: yt && v(y.metalnessMap.channel),
        roughnessMapUv: T && v(y.roughnessMap.channel),
        anisotropyMapUv: at && v(y.anisotropyMap.channel),
        clearcoatMapUv: ut && v(y.clearcoatMap.channel),
        clearcoatNormalMapUv: Wt && v(y.clearcoatNormalMap.channel),
        clearcoatRoughnessMapUv: J && v(y.clearcoatRoughnessMap.channel),
        iridescenceMapUv: dt && v(y.iridescenceMap.channel),
        iridescenceThicknessMapUv: bt && v(y.iridescenceThicknessMap.channel),
        sheenColorMapUv: Ct && v(y.sheenColorMap.channel),
        sheenRoughnessMapUv: ft && v(y.sheenRoughnessMap.channel),
        specularMapUv: Ht && v(y.specularMap.channel),
        specularColorMapUv: Nt && v(y.specularColorMap.channel),
        specularIntensityMapUv: te && v(y.specularIntensityMap.channel),
        transmissionMapUv: D && v(y.transmissionMap.channel),
        thicknessMapUv: it && v(y.thicknessMap.channel),
        alphaMapUv: K && v(y.alphaMap.channel),
        vertexTangents: !!Z.attributes.tangent && (kt || _),
        vertexColors: y.vertexColors,
        vertexAlphas: y.vertexColors === true && !!Z.attributes.color && Z.attributes.color.itemSize === 4,
        pointsUvs: z.isPoints === true && !!Z.attributes.uv && (re || K),
        fog: !!V,
        useFog: y.fog === true,
        fogExp2: !!V && V.isFogExp2,
        flatShading: y.flatShading === true,
        sizeAttenuation: y.sizeAttenuation === true,
        logarithmicDepthBuffer: d,
        reverseDepthBuffer: At,
        skinning: z.isSkinnedMesh === true,
        morphTargets: Z.morphAttributes.position !== void 0,
        morphNormals: Z.morphAttributes.normal !== void 0,
        morphColors: Z.morphAttributes.color !== void 0,
        morphTargetsCount: St,
        morphTextureStride: Ot,
        numDirLights: x.directional.length,
        numPointLights: x.point.length,
        numSpotLights: x.spot.length,
        numSpotLightMaps: x.spotLightMap.length,
        numRectAreaLights: x.rectArea.length,
        numHemiLights: x.hemi.length,
        numDirLightShadows: x.directionalShadowMap.length,
        numPointLightShadows: x.pointShadowMap.length,
        numSpotLightShadows: x.spotShadowMap.length,
        numSpotLightShadowsWithMaps: x.numSpotLightShadowsWithMaps,
        numLightProbes: x.numLightProbes,
        numClippingPlanes: a.numPlanes,
        numClipIntersection: a.numIntersection,
        dithering: y.dithering,
        shadowMapEnabled: i.shadowMap.enabled && C.length > 0,
        shadowMapType: i.shadowMap.type,
        toneMapping: ae,
        decodeVideoTexture: re && y.map.isVideoTexture === true && Gt.getTransfer(y.map.colorSpace) === Kt,
        decodeVideoTextureEmissive: ne && y.emissiveMap.isVideoTexture === true && Gt.getTransfer(y.emissiveMap.colorSpace) === Kt,
        premultipliedAlpha: y.premultipliedAlpha,
        doubleSided: y.side === qe,
        flipSided: y.side === Ie,
        useDepthPacking: y.depthPacking >= 0,
        depthPacking: y.depthPacking || 0,
        index0AttributeName: y.index0AttributeName,
        extensionClipCullDistance: It && y.extensions.clipCullDistance === true && n.has("WEBGL_clip_cull_distance"),
        extensionMultiDraw: (It && y.extensions.multiDraw === true || Bt) && n.has("WEBGL_multi_draw"),
        rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
        customProgramCacheKey: y.customProgramCacheKey()
      };
      return Me.vertexUv1s = c.has(1), Me.vertexUv2s = c.has(2), Me.vertexUv3s = c.has(3), c.clear(), Me;
    }
    function u(y) {
      const x = [];
      if (y.shaderID ? x.push(y.shaderID) : (x.push(y.customVertexShaderID), x.push(y.customFragmentShaderID)), y.defines !== void 0) for (const C in y.defines) x.push(C), x.push(y.defines[C]);
      return y.isRawShaderMaterial === false && (b(x, y), E(x, y), x.push(i.outputColorSpace)), x.push(y.customProgramCacheKey), x.join();
    }
    function b(y, x) {
      y.push(x.precision), y.push(x.outputColorSpace), y.push(x.envMapMode), y.push(x.envMapCubeUVHeight), y.push(x.mapUv), y.push(x.alphaMapUv), y.push(x.lightMapUv), y.push(x.aoMapUv), y.push(x.bumpMapUv), y.push(x.normalMapUv), y.push(x.displacementMapUv), y.push(x.emissiveMapUv), y.push(x.metalnessMapUv), y.push(x.roughnessMapUv), y.push(x.anisotropyMapUv), y.push(x.clearcoatMapUv), y.push(x.clearcoatNormalMapUv), y.push(x.clearcoatRoughnessMapUv), y.push(x.iridescenceMapUv), y.push(x.iridescenceThicknessMapUv), y.push(x.sheenColorMapUv), y.push(x.sheenRoughnessMapUv), y.push(x.specularMapUv), y.push(x.specularColorMapUv), y.push(x.specularIntensityMapUv), y.push(x.transmissionMapUv), y.push(x.thicknessMapUv), y.push(x.combine), y.push(x.fogExp2), y.push(x.sizeAttenuation), y.push(x.morphTargetsCount), y.push(x.morphAttributeCount), y.push(x.numDirLights), y.push(x.numPointLights), y.push(x.numSpotLights), y.push(x.numSpotLightMaps), y.push(x.numHemiLights), y.push(x.numRectAreaLights), y.push(x.numDirLightShadows), y.push(x.numPointLightShadows), y.push(x.numSpotLightShadows), y.push(x.numSpotLightShadowsWithMaps), y.push(x.numLightProbes), y.push(x.shadowMapType), y.push(x.toneMapping), y.push(x.numClippingPlanes), y.push(x.numClipIntersection), y.push(x.depthPacking);
    }
    function E(y, x) {
      o.disableAll(), x.supportsVertexTextures && o.enable(0), x.instancing && o.enable(1), x.instancingColor && o.enable(2), x.instancingMorph && o.enable(3), x.matcap && o.enable(4), x.envMap && o.enable(5), x.normalMapObjectSpace && o.enable(6), x.normalMapTangentSpace && o.enable(7), x.clearcoat && o.enable(8), x.iridescence && o.enable(9), x.alphaTest && o.enable(10), x.vertexColors && o.enable(11), x.vertexAlphas && o.enable(12), x.vertexUv1s && o.enable(13), x.vertexUv2s && o.enable(14), x.vertexUv3s && o.enable(15), x.vertexTangents && o.enable(16), x.anisotropy && o.enable(17), x.alphaHash && o.enable(18), x.batching && o.enable(19), x.dispersion && o.enable(20), x.batchingColor && o.enable(21), y.push(o.mask), o.disableAll(), x.fog && o.enable(0), x.useFog && o.enable(1), x.flatShading && o.enable(2), x.logarithmicDepthBuffer && o.enable(3), x.reverseDepthBuffer && o.enable(4), x.skinning && o.enable(5), x.morphTargets && o.enable(6), x.morphNormals && o.enable(7), x.morphColors && o.enable(8), x.premultipliedAlpha && o.enable(9), x.shadowMapEnabled && o.enable(10), x.doubleSided && o.enable(11), x.flipSided && o.enable(12), x.useDepthPacking && o.enable(13), x.dithering && o.enable(14), x.transmission && o.enable(15), x.sheen && o.enable(16), x.opaque && o.enable(17), x.pointsUvs && o.enable(18), x.decodeVideoTexture && o.enable(19), x.decodeVideoTextureEmissive && o.enable(20), x.alphaToCoverage && o.enable(21), y.push(o.mask);
    }
    function S(y) {
      const x = g[y.type];
      let C;
      if (x) {
        const k = Je[x];
        C = ns.clone(k.uniforms);
      } else C = y.uniforms;
      return C;
    }
    function N(y, x) {
      let C;
      for (let k = 0, z = h.length; k < z; k++) {
        const V = h[k];
        if (V.cacheKey === x) {
          C = V, ++C.usedTimes;
          break;
        }
      }
      return C === void 0 && (C = new u_(i, x, y, r), h.push(C)), C;
    }
    function A(y) {
      if (--y.usedTimes === 0) {
        const x = h.indexOf(y);
        h[x] = h[h.length - 1], h.pop(), y.destroy();
      }
    }
    function w(y) {
      l.remove(y);
    }
    function P() {
      l.dispose();
    }
    return {
      getParameters: m,
      getProgramCacheKey: u,
      getUniforms: S,
      acquireProgram: N,
      releaseProgram: A,
      releaseShaderCache: w,
      programs: h,
      dispose: P
    };
  }
  function g_() {
    let i = /* @__PURE__ */ new WeakMap();
    function t(a) {
      return i.has(a);
    }
    function e(a) {
      let o = i.get(a);
      return o === void 0 && (o = {}, i.set(a, o)), o;
    }
    function n(a) {
      i.delete(a);
    }
    function s(a, o, l) {
      i.get(a)[o] = l;
    }
    function r() {
      i = /* @__PURE__ */ new WeakMap();
    }
    return {
      has: t,
      get: e,
      remove: n,
      update: s,
      dispose: r
    };
  }
  function __(i, t) {
    return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id;
  }
  function wl(i, t) {
    return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id;
  }
  function Cl() {
    const i = [];
    let t = 0;
    const e = [], n = [], s = [];
    function r() {
      t = 0, e.length = 0, n.length = 0, s.length = 0;
    }
    function a(d, f, p, g, v, m) {
      let u = i[t];
      return u === void 0 ? (u = {
        id: d.id,
        object: d,
        geometry: f,
        material: p,
        groupOrder: g,
        renderOrder: d.renderOrder,
        z: v,
        group: m
      }, i[t] = u) : (u.id = d.id, u.object = d, u.geometry = f, u.material = p, u.groupOrder = g, u.renderOrder = d.renderOrder, u.z = v, u.group = m), t++, u;
    }
    function o(d, f, p, g, v, m) {
      const u = a(d, f, p, g, v, m);
      p.transmission > 0 ? n.push(u) : p.transparent === true ? s.push(u) : e.push(u);
    }
    function l(d, f, p, g, v, m) {
      const u = a(d, f, p, g, v, m);
      p.transmission > 0 ? n.unshift(u) : p.transparent === true ? s.unshift(u) : e.unshift(u);
    }
    function c(d, f) {
      e.length > 1 && e.sort(d || __), n.length > 1 && n.sort(f || wl), s.length > 1 && s.sort(f || wl);
    }
    function h() {
      for (let d = t, f = i.length; d < f; d++) {
        const p = i[d];
        if (p.id === null) break;
        p.id = null, p.object = null, p.geometry = null, p.material = null, p.group = null;
      }
    }
    return {
      opaque: e,
      transmissive: n,
      transparent: s,
      init: r,
      push: o,
      unshift: l,
      finish: h,
      sort: c
    };
  }
  function v_() {
    let i = /* @__PURE__ */ new WeakMap();
    function t(n, s) {
      const r = i.get(n);
      let a;
      return r === void 0 ? (a = new Cl(), i.set(n, [
        a
      ])) : s >= r.length ? (a = new Cl(), r.push(a)) : a = r[s], a;
    }
    function e() {
      i = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: t,
      dispose: e
    };
  }
  function x_() {
    const i = {};
    return {
      get: function(t) {
        if (i[t.id] !== void 0) return i[t.id];
        let e;
        switch (t.type) {
          case "DirectionalLight":
            e = {
              direction: new R(),
              color: new Pt()
            };
            break;
          case "SpotLight":
            e = {
              position: new R(),
              direction: new R(),
              color: new Pt(),
              distance: 0,
              coneCos: 0,
              penumbraCos: 0,
              decay: 0
            };
            break;
          case "PointLight":
            e = {
              position: new R(),
              color: new Pt(),
              distance: 0,
              decay: 0
            };
            break;
          case "HemisphereLight":
            e = {
              direction: new R(),
              skyColor: new Pt(),
              groundColor: new Pt()
            };
            break;
          case "RectAreaLight":
            e = {
              color: new Pt(),
              position: new R(),
              halfWidth: new R(),
              halfHeight: new R()
            };
            break;
        }
        return i[t.id] = e, e;
      }
    };
  }
  function M_() {
    const i = {};
    return {
      get: function(t) {
        if (i[t.id] !== void 0) return i[t.id];
        let e;
        switch (t.type) {
          case "DirectionalLight":
            e = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new _t()
            };
            break;
          case "SpotLight":
            e = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new _t()
            };
            break;
          case "PointLight":
            e = {
              shadowIntensity: 1,
              shadowBias: 0,
              shadowNormalBias: 0,
              shadowRadius: 1,
              shadowMapSize: new _t(),
              shadowCameraNear: 1,
              shadowCameraFar: 1e3
            };
            break;
        }
        return i[t.id] = e, e;
      }
    };
  }
  let S_ = 0;
  function y_(i, t) {
    return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0);
  }
  function E_(i) {
    const t = new x_(), e = M_(), n = {
      version: 0,
      hash: {
        directionalLength: -1,
        pointLength: -1,
        spotLength: -1,
        rectAreaLength: -1,
        hemiLength: -1,
        numDirectionalShadows: -1,
        numPointShadows: -1,
        numSpotShadows: -1,
        numSpotMaps: -1,
        numLightProbes: -1
      },
      ambient: [
        0,
        0,
        0
      ],
      probe: [],
      directional: [],
      directionalShadow: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotLightMap: [],
      spotShadow: [],
      spotShadowMap: [],
      spotLightMatrix: [],
      rectArea: [],
      rectAreaLTC1: null,
      rectAreaLTC2: null,
      point: [],
      pointShadow: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],
      numSpotLightShadowsWithMaps: 0,
      numLightProbes: 0
    };
    for (let c = 0; c < 9; c++) n.probe.push(new R());
    const s = new R(), r = new Zt(), a = new Zt();
    function o(c) {
      let h = 0, d = 0, f = 0;
      for (let y = 0; y < 9; y++) n.probe[y].set(0, 0, 0);
      let p = 0, g = 0, v = 0, m = 0, u = 0, b = 0, E = 0, S = 0, N = 0, A = 0, w = 0;
      c.sort(y_);
      for (let y = 0, x = c.length; y < x; y++) {
        const C = c[y], k = C.color, z = C.intensity, V = C.distance, Z = C.shadow && C.shadow.map ? C.shadow.map.texture : null;
        if (C.isAmbientLight) h += k.r * z, d += k.g * z, f += k.b * z;
        else if (C.isLightProbe) {
          for (let W = 0; W < 9; W++) n.probe[W].addScaledVector(C.sh.coefficients[W], z);
          w++;
        } else if (C.isDirectionalLight) {
          const W = t.get(C);
          if (W.color.copy(C.color).multiplyScalar(C.intensity), C.castShadow) {
            const tt = C.shadow, G = e.get(C);
            G.shadowIntensity = tt.intensity, G.shadowBias = tt.bias, G.shadowNormalBias = tt.normalBias, G.shadowRadius = tt.radius, G.shadowMapSize = tt.mapSize, n.directionalShadow[p] = G, n.directionalShadowMap[p] = Z, n.directionalShadowMatrix[p] = C.shadow.matrix, b++;
          }
          n.directional[p] = W, p++;
        } else if (C.isSpotLight) {
          const W = t.get(C);
          W.position.setFromMatrixPosition(C.matrixWorld), W.color.copy(k).multiplyScalar(z), W.distance = V, W.coneCos = Math.cos(C.angle), W.penumbraCos = Math.cos(C.angle * (1 - C.penumbra)), W.decay = C.decay, n.spot[v] = W;
          const tt = C.shadow;
          if (C.map && (n.spotLightMap[N] = C.map, N++, tt.updateMatrices(C), C.castShadow && A++), n.spotLightMatrix[v] = tt.matrix, C.castShadow) {
            const G = e.get(C);
            G.shadowIntensity = tt.intensity, G.shadowBias = tt.bias, G.shadowNormalBias = tt.normalBias, G.shadowRadius = tt.radius, G.shadowMapSize = tt.mapSize, n.spotShadow[v] = G, n.spotShadowMap[v] = Z, S++;
          }
          v++;
        } else if (C.isRectAreaLight) {
          const W = t.get(C);
          W.color.copy(k).multiplyScalar(z), W.halfWidth.set(C.width * 0.5, 0, 0), W.halfHeight.set(0, C.height * 0.5, 0), n.rectArea[m] = W, m++;
        } else if (C.isPointLight) {
          const W = t.get(C);
          if (W.color.copy(C.color).multiplyScalar(C.intensity), W.distance = C.distance, W.decay = C.decay, C.castShadow) {
            const tt = C.shadow, G = e.get(C);
            G.shadowIntensity = tt.intensity, G.shadowBias = tt.bias, G.shadowNormalBias = tt.normalBias, G.shadowRadius = tt.radius, G.shadowMapSize = tt.mapSize, G.shadowCameraNear = tt.camera.near, G.shadowCameraFar = tt.camera.far, n.pointShadow[g] = G, n.pointShadowMap[g] = Z, n.pointShadowMatrix[g] = C.shadow.matrix, E++;
          }
          n.point[g] = W, g++;
        } else if (C.isHemisphereLight) {
          const W = t.get(C);
          W.skyColor.copy(C.color).multiplyScalar(z), W.groundColor.copy(C.groundColor).multiplyScalar(z), n.hemi[u] = W, u++;
        }
      }
      m > 0 && (i.has("OES_texture_float_linear") === true ? (n.rectAreaLTC1 = nt.LTC_FLOAT_1, n.rectAreaLTC2 = nt.LTC_FLOAT_2) : (n.rectAreaLTC1 = nt.LTC_HALF_1, n.rectAreaLTC2 = nt.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = d, n.ambient[2] = f;
      const P = n.hash;
      (P.directionalLength !== p || P.pointLength !== g || P.spotLength !== v || P.rectAreaLength !== m || P.hemiLength !== u || P.numDirectionalShadows !== b || P.numPointShadows !== E || P.numSpotShadows !== S || P.numSpotMaps !== N || P.numLightProbes !== w) && (n.directional.length = p, n.spot.length = v, n.rectArea.length = m, n.point.length = g, n.hemi.length = u, n.directionalShadow.length = b, n.directionalShadowMap.length = b, n.pointShadow.length = E, n.pointShadowMap.length = E, n.spotShadow.length = S, n.spotShadowMap.length = S, n.directionalShadowMatrix.length = b, n.pointShadowMatrix.length = E, n.spotLightMatrix.length = S + N - A, n.spotLightMap.length = N, n.numSpotLightShadowsWithMaps = A, n.numLightProbes = w, P.directionalLength = p, P.pointLength = g, P.spotLength = v, P.rectAreaLength = m, P.hemiLength = u, P.numDirectionalShadows = b, P.numPointShadows = E, P.numSpotShadows = S, P.numSpotMaps = N, P.numLightProbes = w, n.version = S_++);
    }
    function l(c, h) {
      let d = 0, f = 0, p = 0, g = 0, v = 0;
      const m = h.matrixWorldInverse;
      for (let u = 0, b = c.length; u < b; u++) {
        const E = c[u];
        if (E.isDirectionalLight) {
          const S = n.directional[d];
          S.direction.setFromMatrixPosition(E.matrixWorld), s.setFromMatrixPosition(E.target.matrixWorld), S.direction.sub(s), S.direction.transformDirection(m), d++;
        } else if (E.isSpotLight) {
          const S = n.spot[p];
          S.position.setFromMatrixPosition(E.matrixWorld), S.position.applyMatrix4(m), S.direction.setFromMatrixPosition(E.matrixWorld), s.setFromMatrixPosition(E.target.matrixWorld), S.direction.sub(s), S.direction.transformDirection(m), p++;
        } else if (E.isRectAreaLight) {
          const S = n.rectArea[g];
          S.position.setFromMatrixPosition(E.matrixWorld), S.position.applyMatrix4(m), a.identity(), r.copy(E.matrixWorld), r.premultiply(m), a.extractRotation(r), S.halfWidth.set(E.width * 0.5, 0, 0), S.halfHeight.set(0, E.height * 0.5, 0), S.halfWidth.applyMatrix4(a), S.halfHeight.applyMatrix4(a), g++;
        } else if (E.isPointLight) {
          const S = n.point[f];
          S.position.setFromMatrixPosition(E.matrixWorld), S.position.applyMatrix4(m), f++;
        } else if (E.isHemisphereLight) {
          const S = n.hemi[v];
          S.direction.setFromMatrixPosition(E.matrixWorld), S.direction.transformDirection(m), v++;
        }
      }
    }
    return {
      setup: o,
      setupView: l,
      state: n
    };
  }
  function Rl(i) {
    const t = new E_(i), e = [], n = [];
    function s(h) {
      c.camera = h, e.length = 0, n.length = 0;
    }
    function r(h) {
      e.push(h);
    }
    function a(h) {
      n.push(h);
    }
    function o() {
      t.setup(e);
    }
    function l(h) {
      t.setupView(e, h);
    }
    const c = {
      lightsArray: e,
      shadowsArray: n,
      camera: null,
      lights: t,
      transmissionRenderTarget: {}
    };
    return {
      init: s,
      state: c,
      setupLights: o,
      setupLightsView: l,
      pushLight: r,
      pushShadow: a
    };
  }
  function b_(i) {
    let t = /* @__PURE__ */ new WeakMap();
    function e(s, r = 0) {
      const a = t.get(s);
      let o;
      return a === void 0 ? (o = new Rl(i), t.set(s, [
        o
      ])) : r >= a.length ? (o = new Rl(i), a.push(o)) : o = a[r], o;
    }
    function n() {
      t = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: e,
      dispose: n
    };
  }
  class T_ extends $n {
    static get type() {
      return "MeshDepthMaterial";
    }
    constructor(t) {
      super(), this.isMeshDepthMaterial = true, this.depthPacking = ad, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = false, this.wireframeLinewidth = 1, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
    }
  }
  class A_ extends $n {
    static get type() {
      return "MeshDistanceMaterial";
    }
    constructor(t) {
      super(), this.isMeshDistanceMaterial = true, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this;
    }
  }
  const w_ = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, C_ = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
  function R_(i, t, e) {
    let n = new ja();
    const s = new _t(), r = new _t(), a = new Jt(), o = new T_({
      depthPacking: od
    }), l = new A_(), c = {}, h = e.maxTextureSize, d = {
      [Pn]: Ie,
      [Ie]: Pn,
      [qe]: qe
    }, f = new de({
      defines: {
        VSM_SAMPLES: 8
      },
      uniforms: {
        shadow_pass: {
          value: null
        },
        resolution: {
          value: new _t()
        },
        radius: {
          value: 4
        }
      },
      vertexShader: w_,
      fragmentShader: C_
    }), p = f.clone();
    p.defines.HORIZONTAL_PASS = 1;
    const g = new be();
    g.setAttribute("position", new xe(new Float32Array([
      -1,
      -1,
      0.5,
      3,
      -1,
      0.5,
      -1,
      3,
      0.5
    ]), 3));
    const v = new _e(g, f), m = this;
    this.enabled = false, this.autoUpdate = true, this.needsUpdate = false, this.type = Mc;
    let u = this.type;
    this.render = function(A, w, P) {
      if (m.enabled === false || m.autoUpdate === false && m.needsUpdate === false || A.length === 0) return;
      const y = i.getRenderTarget(), x = i.getActiveCubeFace(), C = i.getActiveMipmapLevel(), k = i.state;
      k.setBlending(fn), k.buffers.color.setClear(1, 1, 1, 1), k.buffers.depth.setTest(true), k.setScissorTest(false);
      const z = u !== un && this.type === un, V = u === un && this.type !== un;
      for (let Z = 0, W = A.length; Z < W; Z++) {
        const tt = A[Z], G = tt.shadow;
        if (G === void 0) {
          console.warn("THREE.WebGLShadowMap:", tt, "has no shadow.");
          continue;
        }
        if (G.autoUpdate === false && G.needsUpdate === false) continue;
        s.copy(G.mapSize);
        const st = G.getFrameExtents();
        if (s.multiply(st), r.copy(G.mapSize), (s.x > h || s.y > h) && (s.x > h && (r.x = Math.floor(h / st.x), s.x = r.x * st.x, G.mapSize.x = r.x), s.y > h && (r.y = Math.floor(h / st.y), s.y = r.y * st.y, G.mapSize.y = r.y)), G.map === null || z === true || V === true) {
          const St = this.type !== un ? {
            minFilter: Oe,
            magFilter: Oe
          } : {};
          G.map !== null && G.map.dispose(), G.map = new Ze(s.x, s.y, St), G.map.texture.name = tt.name + ".shadowMap", G.camera.updateProjectionMatrix();
        }
        i.setRenderTarget(G.map), i.clear();
        const ht = G.getViewportCount();
        for (let St = 0; St < ht; St++) {
          const Ot = G.getViewport(St);
          a.set(r.x * Ot.x, r.y * Ot.y, r.x * Ot.z, r.y * Ot.w), k.viewport(a), G.updateMatrices(tt, St), n = G.getFrustum(), S(w, P, G.camera, tt, this.type);
        }
        G.isPointLightShadow !== true && this.type === un && b(G, P), G.needsUpdate = false;
      }
      u = this.type, m.needsUpdate = false, i.setRenderTarget(y, x, C);
    };
    function b(A, w) {
      const P = t.update(v);
      f.defines.VSM_SAMPLES !== A.blurSamples && (f.defines.VSM_SAMPLES = A.blurSamples, p.defines.VSM_SAMPLES = A.blurSamples, f.needsUpdate = true, p.needsUpdate = true), A.mapPass === null && (A.mapPass = new Ze(s.x, s.y)), f.uniforms.shadow_pass.value = A.map.texture, f.uniforms.resolution.value = A.mapSize, f.uniforms.radius.value = A.radius, i.setRenderTarget(A.mapPass), i.clear(), i.renderBufferDirect(w, null, P, f, v, null), p.uniforms.shadow_pass.value = A.mapPass.texture, p.uniforms.resolution.value = A.mapSize, p.uniforms.radius.value = A.radius, i.setRenderTarget(A.map), i.clear(), i.renderBufferDirect(w, null, P, p, v, null);
    }
    function E(A, w, P, y) {
      let x = null;
      const C = P.isPointLight === true ? A.customDistanceMaterial : A.customDepthMaterial;
      if (C !== void 0) x = C;
      else if (x = P.isPointLight === true ? l : o, i.localClippingEnabled && w.clipShadows === true && Array.isArray(w.clippingPlanes) && w.clippingPlanes.length !== 0 || w.displacementMap && w.displacementScale !== 0 || w.alphaMap && w.alphaTest > 0 || w.map && w.alphaTest > 0) {
        const k = x.uuid, z = w.uuid;
        let V = c[k];
        V === void 0 && (V = {}, c[k] = V);
        let Z = V[z];
        Z === void 0 && (Z = x.clone(), V[z] = Z, w.addEventListener("dispose", N)), x = Z;
      }
      if (x.visible = w.visible, x.wireframe = w.wireframe, y === un ? x.side = w.shadowSide !== null ? w.shadowSide : w.side : x.side = w.shadowSide !== null ? w.shadowSide : d[w.side], x.alphaMap = w.alphaMap, x.alphaTest = w.alphaTest, x.map = w.map, x.clipShadows = w.clipShadows, x.clippingPlanes = w.clippingPlanes, x.clipIntersection = w.clipIntersection, x.displacementMap = w.displacementMap, x.displacementScale = w.displacementScale, x.displacementBias = w.displacementBias, x.wireframeLinewidth = w.wireframeLinewidth, x.linewidth = w.linewidth, P.isPointLight === true && x.isMeshDistanceMaterial === true) {
        const k = i.properties.get(x);
        k.light = P;
      }
      return x;
    }
    function S(A, w, P, y, x) {
      if (A.visible === false) return;
      if (A.layers.test(w.layers) && (A.isMesh || A.isLine || A.isPoints) && (A.castShadow || A.receiveShadow && x === un) && (!A.frustumCulled || n.intersectsObject(A))) {
        A.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse, A.matrixWorld);
        const z = t.update(A), V = A.material;
        if (Array.isArray(V)) {
          const Z = z.groups;
          for (let W = 0, tt = Z.length; W < tt; W++) {
            const G = Z[W], st = V[G.materialIndex];
            if (st && st.visible) {
              const ht = E(A, st, y, x);
              A.onBeforeShadow(i, A, w, P, z, ht, G), i.renderBufferDirect(P, null, z, ht, A, G), A.onAfterShadow(i, A, w, P, z, ht, G);
            }
          }
        } else if (V.visible) {
          const Z = E(A, V, y, x);
          A.onBeforeShadow(i, A, w, P, z, Z, null), i.renderBufferDirect(P, null, z, Z, A, null), A.onAfterShadow(i, A, w, P, z, Z, null);
        }
      }
      const k = A.children;
      for (let z = 0, V = k.length; z < V; z++) S(k[z], w, P, y, x);
    }
    function N(A) {
      A.target.removeEventListener("dispose", N);
      for (const P in c) {
        const y = c[P], x = A.target.uuid;
        x in y && (y[x].dispose(), delete y[x]);
      }
    }
  }
  const P_ = {
    [qr]: Yr,
    [jr]: $r,
    [Kr]: Jr,
    [Ti]: Zr,
    [Yr]: qr,
    [$r]: jr,
    [Jr]: Kr,
    [Zr]: Ti
  };
  function D_(i, t) {
    function e() {
      let D = false;
      const it = new Jt();
      let H = null;
      const K = new Jt(0, 0, 0, 0);
      return {
        setMask: function(ct) {
          H !== ct && !D && (i.colorMask(ct, ct, ct, ct), H = ct);
        },
        setLocked: function(ct) {
          D = ct;
        },
        setClear: function(ct, ot, It, ae, Me) {
          Me === true && (ct *= ae, ot *= ae, It *= ae), it.set(ct, ot, It, ae), K.equals(it) === false && (i.clearColor(ct, ot, It, ae), K.copy(it));
        },
        reset: function() {
          D = false, H = null, K.set(-1, 0, 0, 0);
        }
      };
    }
    function n() {
      let D = false, it = false, H = null, K = null, ct = null;
      return {
        setReversed: function(ot) {
          if (it !== ot) {
            const It = t.get("EXT_clip_control");
            it ? It.clipControlEXT(It.LOWER_LEFT_EXT, It.ZERO_TO_ONE_EXT) : It.clipControlEXT(It.LOWER_LEFT_EXT, It.NEGATIVE_ONE_TO_ONE_EXT);
            const ae = ct;
            ct = null, this.setClear(ae);
          }
          it = ot;
        },
        getReversed: function() {
          return it;
        },
        setTest: function(ot) {
          ot ? rt(i.DEPTH_TEST) : At(i.DEPTH_TEST);
        },
        setMask: function(ot) {
          H !== ot && !D && (i.depthMask(ot), H = ot);
        },
        setFunc: function(ot) {
          if (it && (ot = P_[ot]), K !== ot) {
            switch (ot) {
              case qr:
                i.depthFunc(i.NEVER);
                break;
              case Yr:
                i.depthFunc(i.ALWAYS);
                break;
              case jr:
                i.depthFunc(i.LESS);
                break;
              case Ti:
                i.depthFunc(i.LEQUAL);
                break;
              case Kr:
                i.depthFunc(i.EQUAL);
                break;
              case Zr:
                i.depthFunc(i.GEQUAL);
                break;
              case $r:
                i.depthFunc(i.GREATER);
                break;
              case Jr:
                i.depthFunc(i.NOTEQUAL);
                break;
              default:
                i.depthFunc(i.LEQUAL);
            }
            K = ot;
          }
        },
        setLocked: function(ot) {
          D = ot;
        },
        setClear: function(ot) {
          ct !== ot && (it && (ot = 1 - ot), i.clearDepth(ot), ct = ot);
        },
        reset: function() {
          D = false, H = null, K = null, ct = null, it = false;
        }
      };
    }
    function s() {
      let D = false, it = null, H = null, K = null, ct = null, ot = null, It = null, ae = null, Me = null;
      return {
        setTest: function(jt) {
          D || (jt ? rt(i.STENCIL_TEST) : At(i.STENCIL_TEST));
        },
        setMask: function(jt) {
          it !== jt && !D && (i.stencilMask(jt), it = jt);
        },
        setFunc: function(jt, He, sn) {
          (H !== jt || K !== He || ct !== sn) && (i.stencilFunc(jt, He, sn), H = jt, K = He, ct = sn);
        },
        setOp: function(jt, He, sn) {
          (ot !== jt || It !== He || ae !== sn) && (i.stencilOp(jt, He, sn), ot = jt, It = He, ae = sn);
        },
        setLocked: function(jt) {
          D = jt;
        },
        setClear: function(jt) {
          Me !== jt && (i.clearStencil(jt), Me = jt);
        },
        reset: function() {
          D = false, it = null, H = null, K = null, ct = null, ot = null, It = null, ae = null, Me = null;
        }
      };
    }
    const r = new e(), a = new n(), o = new s(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
    let h = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), p = [], g = null, v = false, m = null, u = null, b = null, E = null, S = null, N = null, A = null, w = new Pt(0, 0, 0), P = 0, y = false, x = null, C = null, k = null, z = null, V = null;
    const Z = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    let W = false, tt = 0;
    const G = i.getParameter(i.VERSION);
    G.indexOf("WebGL") !== -1 ? (tt = parseFloat(/^WebGL (\d)/.exec(G)[1]), W = tt >= 1) : G.indexOf("OpenGL ES") !== -1 && (tt = parseFloat(/^OpenGL ES (\d)/.exec(G)[1]), W = tt >= 2);
    let st = null, ht = {};
    const St = i.getParameter(i.SCISSOR_BOX), Ot = i.getParameter(i.VIEWPORT), Qt = new Jt().fromArray(St), Y = new Jt().fromArray(Ot);
    function et(D, it, H, K) {
      const ct = new Uint8Array(4), ot = i.createTexture();
      i.bindTexture(D, ot), i.texParameteri(D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(D, i.TEXTURE_MAG_FILTER, i.NEAREST);
      for (let It = 0; It < H; It++) D === i.TEXTURE_3D || D === i.TEXTURE_2D_ARRAY ? i.texImage3D(it, 0, i.RGBA, 1, 1, K, 0, i.RGBA, i.UNSIGNED_BYTE, ct) : i.texImage2D(it + It, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, ct);
      return ot;
    }
    const vt = {};
    vt[i.TEXTURE_2D] = et(i.TEXTURE_2D, i.TEXTURE_2D, 1), vt[i.TEXTURE_CUBE_MAP] = et(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), vt[i.TEXTURE_2D_ARRAY] = et(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), vt[i.TEXTURE_3D] = et(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), rt(i.DEPTH_TEST), a.setFunc(Ti), zt(false), kt(Lo), rt(i.CULL_FACE), U(fn);
    function rt(D) {
      h[D] !== true && (i.enable(D), h[D] = true);
    }
    function At(D) {
      h[D] !== false && (i.disable(D), h[D] = false);
    }
    function Dt(D, it) {
      return d[D] !== it ? (i.bindFramebuffer(D, it), d[D] = it, D === i.DRAW_FRAMEBUFFER && (d[i.FRAMEBUFFER] = it), D === i.FRAMEBUFFER && (d[i.DRAW_FRAMEBUFFER] = it), true) : false;
    }
    function Bt(D, it) {
      let H = p, K = false;
      if (D) {
        H = f.get(it), H === void 0 && (H = [], f.set(it, H));
        const ct = D.textures;
        if (H.length !== ct.length || H[0] !== i.COLOR_ATTACHMENT0) {
          for (let ot = 0, It = ct.length; ot < It; ot++) H[ot] = i.COLOR_ATTACHMENT0 + ot;
          H.length = ct.length, K = true;
        }
      } else H[0] !== i.BACK && (H[0] = i.BACK, K = true);
      K && i.drawBuffers(H);
    }
    function re(D) {
      return g !== D ? (i.useProgram(D), g = D, true) : false;
    }
    const Vt = {
      [zn]: i.FUNC_ADD,
      [zu]: i.FUNC_SUBTRACT,
      [ku]: i.FUNC_REVERSE_SUBTRACT
    };
    Vt[Hu] = i.MIN, Vt[Gu] = i.MAX;
    const le = {
      [Vu]: i.ZERO,
      [Wu]: i.ONE,
      [Xu]: i.SRC_COLOR,
      [Wr]: i.SRC_ALPHA,
      [$u]: i.SRC_ALPHA_SATURATE,
      [Ku]: i.DST_COLOR,
      [Yu]: i.DST_ALPHA,
      [qu]: i.ONE_MINUS_SRC_COLOR,
      [Xr]: i.ONE_MINUS_SRC_ALPHA,
      [Zu]: i.ONE_MINUS_DST_COLOR,
      [ju]: i.ONE_MINUS_DST_ALPHA,
      [Ju]: i.CONSTANT_COLOR,
      [Qu]: i.ONE_MINUS_CONSTANT_COLOR,
      [td]: i.CONSTANT_ALPHA,
      [ed]: i.ONE_MINUS_CONSTANT_ALPHA
    };
    function U(D, it, H, K, ct, ot, It, ae, Me, jt) {
      if (D === fn) {
        v === true && (At(i.BLEND), v = false);
        return;
      }
      if (v === false && (rt(i.BLEND), v = true), D !== Bu) {
        if (D !== m || jt !== y) {
          if ((u !== zn || S !== zn) && (i.blendEquation(i.FUNC_ADD), u = zn, S = zn), jt) switch (D) {
            case Si:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Wn:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Uo:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case No:
              i.blendFuncSeparate(i.ZERO, i.SRC_COLOR, i.ZERO, i.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", D);
              break;
          }
          else switch (D) {
            case Si:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Wn:
              i.blendFunc(i.SRC_ALPHA, i.ONE);
              break;
            case Uo:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case No:
              i.blendFunc(i.ZERO, i.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", D);
              break;
          }
          b = null, E = null, N = null, A = null, w.set(0, 0, 0), P = 0, m = D, y = jt;
        }
        return;
      }
      ct = ct || it, ot = ot || H, It = It || K, (it !== u || ct !== S) && (i.blendEquationSeparate(Vt[it], Vt[ct]), u = it, S = ct), (H !== b || K !== E || ot !== N || It !== A) && (i.blendFuncSeparate(le[H], le[K], le[ot], le[It]), b = H, E = K, N = ot, A = It), (ae.equals(w) === false || Me !== P) && (i.blendColor(ae.r, ae.g, ae.b, Me), w.copy(ae), P = Me), m = D, y = false;
    }
    function Be(D, it) {
      D.side === qe ? At(i.CULL_FACE) : rt(i.CULL_FACE);
      let H = D.side === Ie;
      it && (H = !H), zt(H), D.blending === Si && D.transparent === false ? U(fn) : U(D.blending, D.blendEquation, D.blendSrc, D.blendDst, D.blendEquationAlpha, D.blendSrcAlpha, D.blendDstAlpha, D.blendColor, D.blendAlpha, D.premultipliedAlpha), a.setFunc(D.depthFunc), a.setTest(D.depthTest), a.setMask(D.depthWrite), r.setMask(D.colorWrite);
      const K = D.stencilWrite;
      o.setTest(K), K && (o.setMask(D.stencilWriteMask), o.setFunc(D.stencilFunc, D.stencilRef, D.stencilFuncMask), o.setOp(D.stencilFail, D.stencilZFail, D.stencilZPass)), ne(D.polygonOffset, D.polygonOffsetFactor, D.polygonOffsetUnits), D.alphaToCoverage === true ? rt(i.SAMPLE_ALPHA_TO_COVERAGE) : At(i.SAMPLE_ALPHA_TO_COVERAGE);
    }
    function zt(D) {
      x !== D && (D ? i.frontFace(i.CW) : i.frontFace(i.CCW), x = D);
    }
    function kt(D) {
      D !== Nu ? (rt(i.CULL_FACE), D !== C && (D === Lo ? i.cullFace(i.BACK) : D === Fu ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : At(i.CULL_FACE), C = D;
    }
    function Et(D) {
      D !== k && (W && i.lineWidth(D), k = D);
    }
    function ne(D, it, H) {
      D ? (rt(i.POLYGON_OFFSET_FILL), (z !== it || V !== H) && (i.polygonOffset(it, H), z = it, V = H)) : At(i.POLYGON_OFFSET_FILL);
    }
    function yt(D) {
      D ? rt(i.SCISSOR_TEST) : At(i.SCISSOR_TEST);
    }
    function T(D) {
      D === void 0 && (D = i.TEXTURE0 + Z - 1), st !== D && (i.activeTexture(D), st = D);
    }
    function _(D, it, H) {
      H === void 0 && (st === null ? H = i.TEXTURE0 + Z - 1 : H = st);
      let K = ht[H];
      K === void 0 && (K = {
        type: void 0,
        texture: void 0
      }, ht[H] = K), (K.type !== D || K.texture !== it) && (st !== H && (i.activeTexture(H), st = H), i.bindTexture(D, it || vt[D]), K.type = D, K.texture = it);
    }
    function F() {
      const D = ht[st];
      D !== void 0 && D.type !== void 0 && (i.bindTexture(D.type, null), D.type = void 0, D.texture = void 0);
    }
    function j() {
      try {
        i.compressedTexImage2D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function $() {
      try {
        i.compressedTexImage3D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function q() {
      try {
        i.texSubImage2D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function xt() {
      try {
        i.texSubImage3D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function at() {
      try {
        i.compressedTexSubImage2D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function ut() {
      try {
        i.compressedTexSubImage3D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function Wt() {
      try {
        i.texStorage2D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function J() {
      try {
        i.texStorage3D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function dt() {
      try {
        i.texImage2D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function bt() {
      try {
        i.texImage3D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function Ct(D) {
      Qt.equals(D) === false && (i.scissor(D.x, D.y, D.z, D.w), Qt.copy(D));
    }
    function ft(D) {
      Y.equals(D) === false && (i.viewport(D.x, D.y, D.z, D.w), Y.copy(D));
    }
    function Ht(D, it) {
      let H = c.get(it);
      H === void 0 && (H = /* @__PURE__ */ new WeakMap(), c.set(it, H));
      let K = H.get(D);
      K === void 0 && (K = i.getUniformBlockIndex(it, D.name), H.set(D, K));
    }
    function Nt(D, it) {
      const K = c.get(it).get(D);
      l.get(it) !== K && (i.uniformBlockBinding(it, K, D.__bindingPointIndex), l.set(it, K));
    }
    function te() {
      i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(true, true, true, true), i.clearColor(0, 0, 0, 0), i.depthMask(true), i.depthFunc(i.LESS), a.setReversed(false), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), h = {}, st = null, ht = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), p = [], g = null, v = false, m = null, u = null, b = null, E = null, S = null, N = null, A = null, w = new Pt(0, 0, 0), P = 0, y = false, x = null, C = null, k = null, z = null, V = null, Qt.set(0, 0, i.canvas.width, i.canvas.height), Y.set(0, 0, i.canvas.width, i.canvas.height), r.reset(), a.reset(), o.reset();
    }
    return {
      buffers: {
        color: r,
        depth: a,
        stencil: o
      },
      enable: rt,
      disable: At,
      bindFramebuffer: Dt,
      drawBuffers: Bt,
      useProgram: re,
      setBlending: U,
      setMaterial: Be,
      setFlipSided: zt,
      setCullFace: kt,
      setLineWidth: Et,
      setPolygonOffset: ne,
      setScissorTest: yt,
      activeTexture: T,
      bindTexture: _,
      unbindTexture: F,
      compressedTexImage2D: j,
      compressedTexImage3D: $,
      texImage2D: dt,
      texImage3D: bt,
      updateUBOMapping: Ht,
      uniformBlockBinding: Nt,
      texStorage2D: Wt,
      texStorage3D: J,
      texSubImage2D: q,
      texSubImage3D: xt,
      compressedTexSubImage2D: at,
      compressedTexSubImage3D: ut,
      scissor: Ct,
      viewport: ft,
      reset: te
    };
  }
  function Pl(i, t, e, n) {
    const s = I_(n);
    switch (e) {
      case Dc:
        return i * t;
      case Lc:
        return i * t;
      case Uc:
        return i * t * 2;
      case Ga:
        return i * t / s.components * s.byteLength;
      case Va:
        return i * t / s.components * s.byteLength;
      case Nc:
        return i * t * 2 / s.components * s.byteLength;
      case Wa:
        return i * t * 2 / s.components * s.byteLength;
      case Ic:
        return i * t * 3 / s.components * s.byteLength;
      case je:
        return i * t * 4 / s.components * s.byteLength;
      case Xa:
        return i * t * 4 / s.components * s.byteLength;
      case ks:
      case Hs:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
      case Gs:
      case Vs:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
      case sa:
      case aa:
        return Math.max(i, 16) * Math.max(t, 8) / 4;
      case ia:
      case ra:
        return Math.max(i, 8) * Math.max(t, 8) / 2;
      case oa:
      case la:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
      case ca:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
      case ha:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
      case ua:
        return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
      case da:
        return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
      case fa:
        return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
      case pa:
        return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
      case ma:
        return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
      case ga:
        return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
      case _a:
        return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
      case va:
        return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
      case xa:
        return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
      case Ma:
        return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
      case Sa:
        return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
      case ya:
        return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
      case Ea:
        return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
      case Ws:
      case ba:
      case Ta:
        return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
      case Fc:
      case Aa:
        return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
      case wa:
      case Ca:
        return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    }
    throw new Error(`Unable to determine texture byte length for ${e} format.`);
  }
  function I_(i) {
    switch (i) {
      case gn:
      case Cc:
        return {
          byteLength: 1,
          components: 1
        };
      case ts:
      case Rc:
      case pn:
        return {
          byteLength: 2,
          components: 1
        };
      case ka:
      case Ha:
        return {
          byteLength: 2,
          components: 4
        };
      case Xn:
      case za:
      case tn:
        return {
          byteLength: 4,
          components: 1
        };
      case Pc:
        return {
          byteLength: 4,
          components: 3
        };
    }
    throw new Error(`Unknown texture type ${i}.`);
  }
  function L_(i, t, e, n, s, r, a) {
    const o = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? false : /OculusBrowser/g.test(navigator.userAgent), c = new _t(), h = /* @__PURE__ */ new WeakMap();
    let d;
    const f = /* @__PURE__ */ new WeakMap();
    let p = false;
    try {
      p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
    } catch {
    }
    function g(T, _) {
      return p ? new OffscreenCanvas(T, _) : Ys("canvas");
    }
    function v(T, _, F) {
      let j = 1;
      const $ = yt(T);
      if (($.width > F || $.height > F) && (j = F / Math.max($.width, $.height)), j < 1) if (typeof HTMLImageElement < "u" && T instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && T instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && T instanceof ImageBitmap || typeof VideoFrame < "u" && T instanceof VideoFrame) {
        const q = Math.floor(j * $.width), xt = Math.floor(j * $.height);
        d === void 0 && (d = g(q, xt));
        const at = _ ? g(q, xt) : d;
        return at.width = q, at.height = xt, at.getContext("2d").drawImage(T, 0, 0, q, xt), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + $.width + "x" + $.height + ") to (" + q + "x" + xt + ")."), at;
      } else return "data" in T && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + $.width + "x" + $.height + ")."), T;
      return T;
    }
    function m(T) {
      return T.generateMipmaps;
    }
    function u(T) {
      i.generateMipmap(T);
    }
    function b(T) {
      return T.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : T.isWebGL3DRenderTarget ? i.TEXTURE_3D : T.isWebGLArrayRenderTarget || T.isCompressedArrayTexture ? i.TEXTURE_2D_ARRAY : i.TEXTURE_2D;
    }
    function E(T, _, F, j, $ = false) {
      if (T !== null) {
        if (i[T] !== void 0) return i[T];
        console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + T + "'");
      }
      let q = _;
      if (_ === i.RED && (F === i.FLOAT && (q = i.R32F), F === i.HALF_FLOAT && (q = i.R16F), F === i.UNSIGNED_BYTE && (q = i.R8)), _ === i.RED_INTEGER && (F === i.UNSIGNED_BYTE && (q = i.R8UI), F === i.UNSIGNED_SHORT && (q = i.R16UI), F === i.UNSIGNED_INT && (q = i.R32UI), F === i.BYTE && (q = i.R8I), F === i.SHORT && (q = i.R16I), F === i.INT && (q = i.R32I)), _ === i.RG && (F === i.FLOAT && (q = i.RG32F), F === i.HALF_FLOAT && (q = i.RG16F), F === i.UNSIGNED_BYTE && (q = i.RG8)), _ === i.RG_INTEGER && (F === i.UNSIGNED_BYTE && (q = i.RG8UI), F === i.UNSIGNED_SHORT && (q = i.RG16UI), F === i.UNSIGNED_INT && (q = i.RG32UI), F === i.BYTE && (q = i.RG8I), F === i.SHORT && (q = i.RG16I), F === i.INT && (q = i.RG32I)), _ === i.RGB_INTEGER && (F === i.UNSIGNED_BYTE && (q = i.RGB8UI), F === i.UNSIGNED_SHORT && (q = i.RGB16UI), F === i.UNSIGNED_INT && (q = i.RGB32UI), F === i.BYTE && (q = i.RGB8I), F === i.SHORT && (q = i.RGB16I), F === i.INT && (q = i.RGB32I)), _ === i.RGBA_INTEGER && (F === i.UNSIGNED_BYTE && (q = i.RGBA8UI), F === i.UNSIGNED_SHORT && (q = i.RGBA16UI), F === i.UNSIGNED_INT && (q = i.RGBA32UI), F === i.BYTE && (q = i.RGBA8I), F === i.SHORT && (q = i.RGBA16I), F === i.INT && (q = i.RGBA32I)), _ === i.RGB && F === i.UNSIGNED_INT_5_9_9_9_REV && (q = i.RGB9_E5), _ === i.RGBA) {
        const xt = $ ? Qs : Gt.getTransfer(j);
        F === i.FLOAT && (q = i.RGBA32F), F === i.HALF_FLOAT && (q = i.RGBA16F), F === i.UNSIGNED_BYTE && (q = xt === Kt ? i.SRGB8_ALPHA8 : i.RGBA8), F === i.UNSIGNED_SHORT_4_4_4_4 && (q = i.RGBA4), F === i.UNSIGNED_SHORT_5_5_5_1 && (q = i.RGB5_A1);
      }
      return (q === i.R16F || q === i.R32F || q === i.RG16F || q === i.RG32F || q === i.RGBA16F || q === i.RGBA32F) && t.get("EXT_color_buffer_float"), q;
    }
    function S(T, _) {
      let F;
      return T ? _ === null || _ === Xn || _ === Ci ? F = i.DEPTH24_STENCIL8 : _ === tn ? F = i.DEPTH32F_STENCIL8 : _ === ts && (F = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : _ === null || _ === Xn || _ === Ci ? F = i.DEPTH_COMPONENT24 : _ === tn ? F = i.DEPTH_COMPONENT32F : _ === ts && (F = i.DEPTH_COMPONENT16), F;
    }
    function N(T, _) {
      return m(T) === true || T.isFramebufferTexture && T.minFilter !== Oe && T.minFilter !== Qe ? Math.log2(Math.max(_.width, _.height)) + 1 : T.mipmaps !== void 0 && T.mipmaps.length > 0 ? T.mipmaps.length : T.isCompressedTexture && Array.isArray(T.image) ? _.mipmaps.length : 1;
    }
    function A(T) {
      const _ = T.target;
      _.removeEventListener("dispose", A), P(_), _.isVideoTexture && h.delete(_);
    }
    function w(T) {
      const _ = T.target;
      _.removeEventListener("dispose", w), x(_);
    }
    function P(T) {
      const _ = n.get(T);
      if (_.__webglInit === void 0) return;
      const F = T.source, j = f.get(F);
      if (j) {
        const $ = j[_.__cacheKey];
        $.usedTimes--, $.usedTimes === 0 && y(T), Object.keys(j).length === 0 && f.delete(F);
      }
      n.remove(T);
    }
    function y(T) {
      const _ = n.get(T);
      i.deleteTexture(_.__webglTexture);
      const F = T.source, j = f.get(F);
      delete j[_.__cacheKey], a.memory.textures--;
    }
    function x(T) {
      const _ = n.get(T);
      if (T.depthTexture && (T.depthTexture.dispose(), n.remove(T.depthTexture)), T.isWebGLCubeRenderTarget) for (let j = 0; j < 6; j++) {
        if (Array.isArray(_.__webglFramebuffer[j])) for (let $ = 0; $ < _.__webglFramebuffer[j].length; $++) i.deleteFramebuffer(_.__webglFramebuffer[j][$]);
        else i.deleteFramebuffer(_.__webglFramebuffer[j]);
        _.__webglDepthbuffer && i.deleteRenderbuffer(_.__webglDepthbuffer[j]);
      }
      else {
        if (Array.isArray(_.__webglFramebuffer)) for (let j = 0; j < _.__webglFramebuffer.length; j++) i.deleteFramebuffer(_.__webglFramebuffer[j]);
        else i.deleteFramebuffer(_.__webglFramebuffer);
        if (_.__webglDepthbuffer && i.deleteRenderbuffer(_.__webglDepthbuffer), _.__webglMultisampledFramebuffer && i.deleteFramebuffer(_.__webglMultisampledFramebuffer), _.__webglColorRenderbuffer) for (let j = 0; j < _.__webglColorRenderbuffer.length; j++) _.__webglColorRenderbuffer[j] && i.deleteRenderbuffer(_.__webglColorRenderbuffer[j]);
        _.__webglDepthRenderbuffer && i.deleteRenderbuffer(_.__webglDepthRenderbuffer);
      }
      const F = T.textures;
      for (let j = 0, $ = F.length; j < $; j++) {
        const q = n.get(F[j]);
        q.__webglTexture && (i.deleteTexture(q.__webglTexture), a.memory.textures--), n.remove(F[j]);
      }
      n.remove(T);
    }
    let C = 0;
    function k() {
      C = 0;
    }
    function z() {
      const T = C;
      return T >= s.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + T + " texture units while this GPU supports only " + s.maxTextures), C += 1, T;
    }
    function V(T) {
      const _ = [];
      return _.push(T.wrapS), _.push(T.wrapT), _.push(T.wrapR || 0), _.push(T.magFilter), _.push(T.minFilter), _.push(T.anisotropy), _.push(T.internalFormat), _.push(T.format), _.push(T.type), _.push(T.generateMipmaps), _.push(T.premultiplyAlpha), _.push(T.flipY), _.push(T.unpackAlignment), _.push(T.colorSpace), _.join();
    }
    function Z(T, _) {
      const F = n.get(T);
      if (T.isVideoTexture && Et(T), T.isRenderTargetTexture === false && T.version > 0 && F.__version !== T.version) {
        const j = T.image;
        if (j === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
        else if (j.complete === false) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
        else {
          Y(F, T, _);
          return;
        }
      }
      e.bindTexture(i.TEXTURE_2D, F.__webglTexture, i.TEXTURE0 + _);
    }
    function W(T, _) {
      const F = n.get(T);
      if (T.version > 0 && F.__version !== T.version) {
        Y(F, T, _);
        return;
      }
      e.bindTexture(i.TEXTURE_2D_ARRAY, F.__webglTexture, i.TEXTURE0 + _);
    }
    function tt(T, _) {
      const F = n.get(T);
      if (T.version > 0 && F.__version !== T.version) {
        Y(F, T, _);
        return;
      }
      e.bindTexture(i.TEXTURE_3D, F.__webglTexture, i.TEXTURE0 + _);
    }
    function G(T, _) {
      const F = n.get(T);
      if (T.version > 0 && F.__version !== T.version) {
        et(F, T, _);
        return;
      }
      e.bindTexture(i.TEXTURE_CUBE_MAP, F.__webglTexture, i.TEXTURE0 + _);
    }
    const st = {
      [ea]: i.REPEAT,
      [Hn]: i.CLAMP_TO_EDGE,
      [na]: i.MIRRORED_REPEAT
    }, ht = {
      [Oe]: i.NEAREST,
      [rd]: i.NEAREST_MIPMAP_NEAREST,
      [us]: i.NEAREST_MIPMAP_LINEAR,
      [Qe]: i.LINEAR,
      [ar]: i.LINEAR_MIPMAP_NEAREST,
      [Gn]: i.LINEAR_MIPMAP_LINEAR
    }, St = {
      [cd]: i.NEVER,
      [md]: i.ALWAYS,
      [hd]: i.LESS,
      [Bc]: i.LEQUAL,
      [ud]: i.EQUAL,
      [pd]: i.GEQUAL,
      [dd]: i.GREATER,
      [fd]: i.NOTEQUAL
    };
    function Ot(T, _) {
      if (_.type === tn && t.has("OES_texture_float_linear") === false && (_.magFilter === Qe || _.magFilter === ar || _.magFilter === us || _.magFilter === Gn || _.minFilter === Qe || _.minFilter === ar || _.minFilter === us || _.minFilter === Gn) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(T, i.TEXTURE_WRAP_S, st[_.wrapS]), i.texParameteri(T, i.TEXTURE_WRAP_T, st[_.wrapT]), (T === i.TEXTURE_3D || T === i.TEXTURE_2D_ARRAY) && i.texParameteri(T, i.TEXTURE_WRAP_R, st[_.wrapR]), i.texParameteri(T, i.TEXTURE_MAG_FILTER, ht[_.magFilter]), i.texParameteri(T, i.TEXTURE_MIN_FILTER, ht[_.minFilter]), _.compareFunction && (i.texParameteri(T, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(T, i.TEXTURE_COMPARE_FUNC, St[_.compareFunction])), t.has("EXT_texture_filter_anisotropic") === true) {
        if (_.magFilter === Oe || _.minFilter !== us && _.minFilter !== Gn || _.type === tn && t.has("OES_texture_float_linear") === false) return;
        if (_.anisotropy > 1 || n.get(_).__currentAnisotropy) {
          const F = t.get("EXT_texture_filter_anisotropic");
          i.texParameterf(T, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(_.anisotropy, s.getMaxAnisotropy())), n.get(_).__currentAnisotropy = _.anisotropy;
        }
      }
    }
    function Qt(T, _) {
      let F = false;
      T.__webglInit === void 0 && (T.__webglInit = true, _.addEventListener("dispose", A));
      const j = _.source;
      let $ = f.get(j);
      $ === void 0 && ($ = {}, f.set(j, $));
      const q = V(_);
      if (q !== T.__cacheKey) {
        $[q] === void 0 && ($[q] = {
          texture: i.createTexture(),
          usedTimes: 0
        }, a.memory.textures++, F = true), $[q].usedTimes++;
        const xt = $[T.__cacheKey];
        xt !== void 0 && ($[T.__cacheKey].usedTimes--, xt.usedTimes === 0 && y(_)), T.__cacheKey = q, T.__webglTexture = $[q].texture;
      }
      return F;
    }
    function Y(T, _, F) {
      let j = i.TEXTURE_2D;
      (_.isDataArrayTexture || _.isCompressedArrayTexture) && (j = i.TEXTURE_2D_ARRAY), _.isData3DTexture && (j = i.TEXTURE_3D);
      const $ = Qt(T, _), q = _.source;
      e.bindTexture(j, T.__webglTexture, i.TEXTURE0 + F);
      const xt = n.get(q);
      if (q.version !== xt.__version || $ === true) {
        e.activeTexture(i.TEXTURE0 + F);
        const at = Gt.getPrimaries(Gt.workingColorSpace), ut = _.colorSpace === An ? null : Gt.getPrimaries(_.colorSpace), Wt = _.colorSpace === An || at === ut ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
        i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, _.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, _.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, _.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Wt);
        let J = v(_.image, false, s.maxTextureSize);
        J = ne(_, J);
        const dt = r.convert(_.format, _.colorSpace), bt = r.convert(_.type);
        let Ct = E(_.internalFormat, dt, bt, _.colorSpace, _.isVideoTexture);
        Ot(j, _);
        let ft;
        const Ht = _.mipmaps, Nt = _.isVideoTexture !== true, te = xt.__version === void 0 || $ === true, D = q.dataReady, it = N(_, J);
        if (_.isDepthTexture) Ct = S(_.format === Ri, _.type), te && (Nt ? e.texStorage2D(i.TEXTURE_2D, 1, Ct, J.width, J.height) : e.texImage2D(i.TEXTURE_2D, 0, Ct, J.width, J.height, 0, dt, bt, null));
        else if (_.isDataTexture) if (Ht.length > 0) {
          Nt && te && e.texStorage2D(i.TEXTURE_2D, it, Ct, Ht[0].width, Ht[0].height);
          for (let H = 0, K = Ht.length; H < K; H++) ft = Ht[H], Nt ? D && e.texSubImage2D(i.TEXTURE_2D, H, 0, 0, ft.width, ft.height, dt, bt, ft.data) : e.texImage2D(i.TEXTURE_2D, H, Ct, ft.width, ft.height, 0, dt, bt, ft.data);
          _.generateMipmaps = false;
        } else Nt ? (te && e.texStorage2D(i.TEXTURE_2D, it, Ct, J.width, J.height), D && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, J.width, J.height, dt, bt, J.data)) : e.texImage2D(i.TEXTURE_2D, 0, Ct, J.width, J.height, 0, dt, bt, J.data);
        else if (_.isCompressedTexture) if (_.isCompressedArrayTexture) {
          Nt && te && e.texStorage3D(i.TEXTURE_2D_ARRAY, it, Ct, Ht[0].width, Ht[0].height, J.depth);
          for (let H = 0, K = Ht.length; H < K; H++) if (ft = Ht[H], _.format !== je) if (dt !== null) if (Nt) {
            if (D) if (_.layerUpdates.size > 0) {
              const ct = Pl(ft.width, ft.height, _.format, _.type);
              for (const ot of _.layerUpdates) {
                const It = ft.data.subarray(ot * ct / ft.data.BYTES_PER_ELEMENT, (ot + 1) * ct / ft.data.BYTES_PER_ELEMENT);
                e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, H, 0, 0, ot, ft.width, ft.height, 1, dt, It);
              }
              _.clearLayerUpdates();
            } else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, H, 0, 0, 0, ft.width, ft.height, J.depth, dt, ft.data);
          } else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, H, Ct, ft.width, ft.height, J.depth, 0, ft.data, 0, 0);
          else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
          else Nt ? D && e.texSubImage3D(i.TEXTURE_2D_ARRAY, H, 0, 0, 0, ft.width, ft.height, J.depth, dt, bt, ft.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, H, Ct, ft.width, ft.height, J.depth, 0, dt, bt, ft.data);
        } else {
          Nt && te && e.texStorage2D(i.TEXTURE_2D, it, Ct, Ht[0].width, Ht[0].height);
          for (let H = 0, K = Ht.length; H < K; H++) ft = Ht[H], _.format !== je ? dt !== null ? Nt ? D && e.compressedTexSubImage2D(i.TEXTURE_2D, H, 0, 0, ft.width, ft.height, dt, ft.data) : e.compressedTexImage2D(i.TEXTURE_2D, H, Ct, ft.width, ft.height, 0, ft.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : Nt ? D && e.texSubImage2D(i.TEXTURE_2D, H, 0, 0, ft.width, ft.height, dt, bt, ft.data) : e.texImage2D(i.TEXTURE_2D, H, Ct, ft.width, ft.height, 0, dt, bt, ft.data);
        }
        else if (_.isDataArrayTexture) if (Nt) {
          if (te && e.texStorage3D(i.TEXTURE_2D_ARRAY, it, Ct, J.width, J.height, J.depth), D) if (_.layerUpdates.size > 0) {
            const H = Pl(J.width, J.height, _.format, _.type);
            for (const K of _.layerUpdates) {
              const ct = J.data.subarray(K * H / J.data.BYTES_PER_ELEMENT, (K + 1) * H / J.data.BYTES_PER_ELEMENT);
              e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, K, J.width, J.height, 1, dt, bt, ct);
            }
            _.clearLayerUpdates();
          } else e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, J.width, J.height, J.depth, dt, bt, J.data);
        } else e.texImage3D(i.TEXTURE_2D_ARRAY, 0, Ct, J.width, J.height, J.depth, 0, dt, bt, J.data);
        else if (_.isData3DTexture) Nt ? (te && e.texStorage3D(i.TEXTURE_3D, it, Ct, J.width, J.height, J.depth), D && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, J.width, J.height, J.depth, dt, bt, J.data)) : e.texImage3D(i.TEXTURE_3D, 0, Ct, J.width, J.height, J.depth, 0, dt, bt, J.data);
        else if (_.isFramebufferTexture) {
          if (te) if (Nt) e.texStorage2D(i.TEXTURE_2D, it, Ct, J.width, J.height);
          else {
            let H = J.width, K = J.height;
            for (let ct = 0; ct < it; ct++) e.texImage2D(i.TEXTURE_2D, ct, Ct, H, K, 0, dt, bt, null), H >>= 1, K >>= 1;
          }
        } else if (Ht.length > 0) {
          if (Nt && te) {
            const H = yt(Ht[0]);
            e.texStorage2D(i.TEXTURE_2D, it, Ct, H.width, H.height);
          }
          for (let H = 0, K = Ht.length; H < K; H++) ft = Ht[H], Nt ? D && e.texSubImage2D(i.TEXTURE_2D, H, 0, 0, dt, bt, ft) : e.texImage2D(i.TEXTURE_2D, H, Ct, dt, bt, ft);
          _.generateMipmaps = false;
        } else if (Nt) {
          if (te) {
            const H = yt(J);
            e.texStorage2D(i.TEXTURE_2D, it, Ct, H.width, H.height);
          }
          D && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, dt, bt, J);
        } else e.texImage2D(i.TEXTURE_2D, 0, Ct, dt, bt, J);
        m(_) && u(j), xt.__version = q.version, _.onUpdate && _.onUpdate(_);
      }
      T.__version = _.version;
    }
    function et(T, _, F) {
      if (_.image.length !== 6) return;
      const j = Qt(T, _), $ = _.source;
      e.bindTexture(i.TEXTURE_CUBE_MAP, T.__webglTexture, i.TEXTURE0 + F);
      const q = n.get($);
      if ($.version !== q.__version || j === true) {
        e.activeTexture(i.TEXTURE0 + F);
        const xt = Gt.getPrimaries(Gt.workingColorSpace), at = _.colorSpace === An ? null : Gt.getPrimaries(_.colorSpace), ut = _.colorSpace === An || xt === at ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
        i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, _.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, _.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, _.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, ut);
        const Wt = _.isCompressedTexture || _.image[0].isCompressedTexture, J = _.image[0] && _.image[0].isDataTexture, dt = [];
        for (let K = 0; K < 6; K++) !Wt && !J ? dt[K] = v(_.image[K], true, s.maxCubemapSize) : dt[K] = J ? _.image[K].image : _.image[K], dt[K] = ne(_, dt[K]);
        const bt = dt[0], Ct = r.convert(_.format, _.colorSpace), ft = r.convert(_.type), Ht = E(_.internalFormat, Ct, ft, _.colorSpace), Nt = _.isVideoTexture !== true, te = q.__version === void 0 || j === true, D = $.dataReady;
        let it = N(_, bt);
        Ot(i.TEXTURE_CUBE_MAP, _);
        let H;
        if (Wt) {
          Nt && te && e.texStorage2D(i.TEXTURE_CUBE_MAP, it, Ht, bt.width, bt.height);
          for (let K = 0; K < 6; K++) {
            H = dt[K].mipmaps;
            for (let ct = 0; ct < H.length; ct++) {
              const ot = H[ct];
              _.format !== je ? Ct !== null ? Nt ? D && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct, 0, 0, ot.width, ot.height, Ct, ot.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct, Ht, ot.width, ot.height, 0, ot.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Nt ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct, 0, 0, ot.width, ot.height, Ct, ft, ot.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct, Ht, ot.width, ot.height, 0, Ct, ft, ot.data);
            }
          }
        } else {
          if (H = _.mipmaps, Nt && te) {
            H.length > 0 && it++;
            const K = yt(dt[0]);
            e.texStorage2D(i.TEXTURE_CUBE_MAP, it, Ht, K.width, K.height);
          }
          for (let K = 0; K < 6; K++) if (J) {
            Nt ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, 0, 0, dt[K].width, dt[K].height, Ct, ft, dt[K].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, Ht, dt[K].width, dt[K].height, 0, Ct, ft, dt[K].data);
            for (let ct = 0; ct < H.length; ct++) {
              const It = H[ct].image[K].image;
              Nt ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct + 1, 0, 0, It.width, It.height, Ct, ft, It.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct + 1, Ht, It.width, It.height, 0, Ct, ft, It.data);
            }
          } else {
            Nt ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, 0, 0, Ct, ft, dt[K]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, 0, Ht, Ct, ft, dt[K]);
            for (let ct = 0; ct < H.length; ct++) {
              const ot = H[ct];
              Nt ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct + 1, 0, 0, Ct, ft, ot.image[K]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + K, ct + 1, Ht, Ct, ft, ot.image[K]);
            }
          }
        }
        m(_) && u(i.TEXTURE_CUBE_MAP), q.__version = $.version, _.onUpdate && _.onUpdate(_);
      }
      T.__version = _.version;
    }
    function vt(T, _, F, j, $, q) {
      const xt = r.convert(F.format, F.colorSpace), at = r.convert(F.type), ut = E(F.internalFormat, xt, at, F.colorSpace), Wt = n.get(_), J = n.get(F);
      if (J.__renderTarget = _, !Wt.__hasExternalTextures) {
        const dt = Math.max(1, _.width >> q), bt = Math.max(1, _.height >> q);
        $ === i.TEXTURE_3D || $ === i.TEXTURE_2D_ARRAY ? e.texImage3D($, q, ut, dt, bt, _.depth, 0, xt, at, null) : e.texImage2D($, q, ut, dt, bt, 0, xt, at, null);
      }
      e.bindFramebuffer(i.FRAMEBUFFER, T), kt(_) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, j, $, J.__webglTexture, 0, zt(_)) : ($ === i.TEXTURE_2D || $ >= i.TEXTURE_CUBE_MAP_POSITIVE_X && $ <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, j, $, J.__webglTexture, q), e.bindFramebuffer(i.FRAMEBUFFER, null);
    }
    function rt(T, _, F) {
      if (i.bindRenderbuffer(i.RENDERBUFFER, T), _.depthBuffer) {
        const j = _.depthTexture, $ = j && j.isDepthTexture ? j.type : null, q = S(_.stencilBuffer, $), xt = _.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, at = zt(_);
        kt(_) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, at, q, _.width, _.height) : F ? i.renderbufferStorageMultisample(i.RENDERBUFFER, at, q, _.width, _.height) : i.renderbufferStorage(i.RENDERBUFFER, q, _.width, _.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, xt, i.RENDERBUFFER, T);
      } else {
        const j = _.textures;
        for (let $ = 0; $ < j.length; $++) {
          const q = j[$], xt = r.convert(q.format, q.colorSpace), at = r.convert(q.type), ut = E(q.internalFormat, xt, at, q.colorSpace), Wt = zt(_);
          F && kt(_) === false ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Wt, ut, _.width, _.height) : kt(_) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Wt, ut, _.width, _.height) : i.renderbufferStorage(i.RENDERBUFFER, ut, _.width, _.height);
        }
      }
      i.bindRenderbuffer(i.RENDERBUFFER, null);
    }
    function At(T, _) {
      if (_ && _.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
      if (e.bindFramebuffer(i.FRAMEBUFFER, T), !(_.depthTexture && _.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
      const j = n.get(_.depthTexture);
      j.__renderTarget = _, (!j.__webglTexture || _.depthTexture.image.width !== _.width || _.depthTexture.image.height !== _.height) && (_.depthTexture.image.width = _.width, _.depthTexture.image.height = _.height, _.depthTexture.needsUpdate = true), Z(_.depthTexture, 0);
      const $ = j.__webglTexture, q = zt(_);
      if (_.depthTexture.format === yi) kt(_) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, $, 0, q) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, $, 0);
      else if (_.depthTexture.format === Ri) kt(_) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, $, 0, q) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, $, 0);
      else throw new Error("Unknown depthTexture format");
    }
    function Dt(T) {
      const _ = n.get(T), F = T.isWebGLCubeRenderTarget === true;
      if (_.__boundDepthTexture !== T.depthTexture) {
        const j = T.depthTexture;
        if (_.__depthDisposeCallback && _.__depthDisposeCallback(), j) {
          const $ = () => {
            delete _.__boundDepthTexture, delete _.__depthDisposeCallback, j.removeEventListener("dispose", $);
          };
          j.addEventListener("dispose", $), _.__depthDisposeCallback = $;
        }
        _.__boundDepthTexture = j;
      }
      if (T.depthTexture && !_.__autoAllocateDepthBuffer) {
        if (F) throw new Error("target.depthTexture not supported in Cube render targets");
        At(_.__webglFramebuffer, T);
      } else if (F) {
        _.__webglDepthbuffer = [];
        for (let j = 0; j < 6; j++) if (e.bindFramebuffer(i.FRAMEBUFFER, _.__webglFramebuffer[j]), _.__webglDepthbuffer[j] === void 0) _.__webglDepthbuffer[j] = i.createRenderbuffer(), rt(_.__webglDepthbuffer[j], T, false);
        else {
          const $ = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, q = _.__webglDepthbuffer[j];
          i.bindRenderbuffer(i.RENDERBUFFER, q), i.framebufferRenderbuffer(i.FRAMEBUFFER, $, i.RENDERBUFFER, q);
        }
      } else if (e.bindFramebuffer(i.FRAMEBUFFER, _.__webglFramebuffer), _.__webglDepthbuffer === void 0) _.__webglDepthbuffer = i.createRenderbuffer(), rt(_.__webglDepthbuffer, T, false);
      else {
        const j = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, $ = _.__webglDepthbuffer;
        i.bindRenderbuffer(i.RENDERBUFFER, $), i.framebufferRenderbuffer(i.FRAMEBUFFER, j, i.RENDERBUFFER, $);
      }
      e.bindFramebuffer(i.FRAMEBUFFER, null);
    }
    function Bt(T, _, F) {
      const j = n.get(T);
      _ !== void 0 && vt(j.__webglFramebuffer, T, T.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), F !== void 0 && Dt(T);
    }
    function re(T) {
      const _ = T.texture, F = n.get(T), j = n.get(_);
      T.addEventListener("dispose", w);
      const $ = T.textures, q = T.isWebGLCubeRenderTarget === true, xt = $.length > 1;
      if (xt || (j.__webglTexture === void 0 && (j.__webglTexture = i.createTexture()), j.__version = _.version, a.memory.textures++), q) {
        F.__webglFramebuffer = [];
        for (let at = 0; at < 6; at++) if (_.mipmaps && _.mipmaps.length > 0) {
          F.__webglFramebuffer[at] = [];
          for (let ut = 0; ut < _.mipmaps.length; ut++) F.__webglFramebuffer[at][ut] = i.createFramebuffer();
        } else F.__webglFramebuffer[at] = i.createFramebuffer();
      } else {
        if (_.mipmaps && _.mipmaps.length > 0) {
          F.__webglFramebuffer = [];
          for (let at = 0; at < _.mipmaps.length; at++) F.__webglFramebuffer[at] = i.createFramebuffer();
        } else F.__webglFramebuffer = i.createFramebuffer();
        if (xt) for (let at = 0, ut = $.length; at < ut; at++) {
          const Wt = n.get($[at]);
          Wt.__webglTexture === void 0 && (Wt.__webglTexture = i.createTexture(), a.memory.textures++);
        }
        if (T.samples > 0 && kt(T) === false) {
          F.__webglMultisampledFramebuffer = i.createFramebuffer(), F.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
          for (let at = 0; at < $.length; at++) {
            const ut = $[at];
            F.__webglColorRenderbuffer[at] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, F.__webglColorRenderbuffer[at]);
            const Wt = r.convert(ut.format, ut.colorSpace), J = r.convert(ut.type), dt = E(ut.internalFormat, Wt, J, ut.colorSpace, T.isXRRenderTarget === true), bt = zt(T);
            i.renderbufferStorageMultisample(i.RENDERBUFFER, bt, dt, T.width, T.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + at, i.RENDERBUFFER, F.__webglColorRenderbuffer[at]);
          }
          i.bindRenderbuffer(i.RENDERBUFFER, null), T.depthBuffer && (F.__webglDepthRenderbuffer = i.createRenderbuffer(), rt(F.__webglDepthRenderbuffer, T, true)), e.bindFramebuffer(i.FRAMEBUFFER, null);
        }
      }
      if (q) {
        e.bindTexture(i.TEXTURE_CUBE_MAP, j.__webglTexture), Ot(i.TEXTURE_CUBE_MAP, _);
        for (let at = 0; at < 6; at++) if (_.mipmaps && _.mipmaps.length > 0) for (let ut = 0; ut < _.mipmaps.length; ut++) vt(F.__webglFramebuffer[at][ut], T, _, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, ut);
        else vt(F.__webglFramebuffer[at], T, _, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, 0);
        m(_) && u(i.TEXTURE_CUBE_MAP), e.unbindTexture();
      } else if (xt) {
        for (let at = 0, ut = $.length; at < ut; at++) {
          const Wt = $[at], J = n.get(Wt);
          e.bindTexture(i.TEXTURE_2D, J.__webglTexture), Ot(i.TEXTURE_2D, Wt), vt(F.__webglFramebuffer, T, Wt, i.COLOR_ATTACHMENT0 + at, i.TEXTURE_2D, 0), m(Wt) && u(i.TEXTURE_2D);
        }
        e.unbindTexture();
      } else {
        let at = i.TEXTURE_2D;
        if ((T.isWebGL3DRenderTarget || T.isWebGLArrayRenderTarget) && (at = T.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(at, j.__webglTexture), Ot(at, _), _.mipmaps && _.mipmaps.length > 0) for (let ut = 0; ut < _.mipmaps.length; ut++) vt(F.__webglFramebuffer[ut], T, _, i.COLOR_ATTACHMENT0, at, ut);
        else vt(F.__webglFramebuffer, T, _, i.COLOR_ATTACHMENT0, at, 0);
        m(_) && u(at), e.unbindTexture();
      }
      T.depthBuffer && Dt(T);
    }
    function Vt(T) {
      const _ = T.textures;
      for (let F = 0, j = _.length; F < j; F++) {
        const $ = _[F];
        if (m($)) {
          const q = b(T), xt = n.get($).__webglTexture;
          e.bindTexture(q, xt), u(q), e.unbindTexture();
        }
      }
    }
    const le = [], U = [];
    function Be(T) {
      if (T.samples > 0) {
        if (kt(T) === false) {
          const _ = T.textures, F = T.width, j = T.height;
          let $ = i.COLOR_BUFFER_BIT;
          const q = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, xt = n.get(T), at = _.length > 1;
          if (at) for (let ut = 0; ut < _.length; ut++) e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.TEXTURE_2D, null, 0);
          e.bindFramebuffer(i.READ_FRAMEBUFFER, xt.__webglMultisampledFramebuffer), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, xt.__webglFramebuffer);
          for (let ut = 0; ut < _.length; ut++) {
            if (T.resolveDepthBuffer && (T.depthBuffer && ($ |= i.DEPTH_BUFFER_BIT), T.stencilBuffer && T.resolveStencilBuffer && ($ |= i.STENCIL_BUFFER_BIT)), at) {
              i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, xt.__webglColorRenderbuffer[ut]);
              const Wt = n.get(_[ut]).__webglTexture;
              i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, Wt, 0);
            }
            i.blitFramebuffer(0, 0, F, j, 0, 0, F, j, $, i.NEAREST), l === true && (le.length = 0, U.length = 0, le.push(i.COLOR_ATTACHMENT0 + ut), T.depthBuffer && T.resolveDepthBuffer === false && (le.push(q), U.push(q), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, U)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, le));
          }
          if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), at) for (let ut = 0; ut < _.length; ut++) {
            e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.RENDERBUFFER, xt.__webglColorRenderbuffer[ut]);
            const Wt = n.get(_[ut]).__webglTexture;
            e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.TEXTURE_2D, Wt, 0);
          }
          e.bindFramebuffer(i.DRAW_FRAMEBUFFER, xt.__webglMultisampledFramebuffer);
        } else if (T.depthBuffer && T.resolveDepthBuffer === false && l) {
          const _ = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
          i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [
            _
          ]);
        }
      }
    }
    function zt(T) {
      return Math.min(s.maxSamples, T.samples);
    }
    function kt(T) {
      const _ = n.get(T);
      return T.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === true && _.__useRenderToTexture !== false;
    }
    function Et(T) {
      const _ = a.render.frame;
      h.get(T) !== _ && (h.set(T, _), T.update());
    }
    function ne(T, _) {
      const F = T.colorSpace, j = T.format, $ = T.type;
      return T.isCompressedTexture === true || T.isVideoTexture === true || F !== Ii && F !== An && (Gt.getTransfer(F) === Kt ? (j !== je || $ !== gn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), _;
    }
    function yt(T) {
      return typeof HTMLImageElement < "u" && T instanceof HTMLImageElement ? (c.width = T.naturalWidth || T.width, c.height = T.naturalHeight || T.height) : typeof VideoFrame < "u" && T instanceof VideoFrame ? (c.width = T.displayWidth, c.height = T.displayHeight) : (c.width = T.width, c.height = T.height), c;
    }
    this.allocateTextureUnit = z, this.resetTextureUnits = k, this.setTexture2D = Z, this.setTexture2DArray = W, this.setTexture3D = tt, this.setTextureCube = G, this.rebindTextures = Bt, this.setupRenderTarget = re, this.updateRenderTargetMipmap = Vt, this.updateMultisampleRenderTarget = Be, this.setupDepthRenderbuffer = Dt, this.setupFrameBufferTexture = vt, this.useMultisampledRTT = kt;
  }
  function U_(i, t) {
    function e(n, s = An) {
      let r;
      const a = Gt.getTransfer(s);
      if (n === gn) return i.UNSIGNED_BYTE;
      if (n === ka) return i.UNSIGNED_SHORT_4_4_4_4;
      if (n === Ha) return i.UNSIGNED_SHORT_5_5_5_1;
      if (n === Pc) return i.UNSIGNED_INT_5_9_9_9_REV;
      if (n === Cc) return i.BYTE;
      if (n === Rc) return i.SHORT;
      if (n === ts) return i.UNSIGNED_SHORT;
      if (n === za) return i.INT;
      if (n === Xn) return i.UNSIGNED_INT;
      if (n === tn) return i.FLOAT;
      if (n === pn) return i.HALF_FLOAT;
      if (n === Dc) return i.ALPHA;
      if (n === Ic) return i.RGB;
      if (n === je) return i.RGBA;
      if (n === Lc) return i.LUMINANCE;
      if (n === Uc) return i.LUMINANCE_ALPHA;
      if (n === yi) return i.DEPTH_COMPONENT;
      if (n === Ri) return i.DEPTH_STENCIL;
      if (n === Ga) return i.RED;
      if (n === Va) return i.RED_INTEGER;
      if (n === Nc) return i.RG;
      if (n === Wa) return i.RG_INTEGER;
      if (n === Xa) return i.RGBA_INTEGER;
      if (n === ks || n === Hs || n === Gs || n === Vs) if (a === Kt) if (r = t.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
        if (n === ks) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        if (n === Hs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        if (n === Gs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        if (n === Vs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      } else return null;
      else if (r = t.get("WEBGL_compressed_texture_s3tc"), r !== null) {
        if (n === ks) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Hs) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Gs) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === Vs) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else return null;
      if (n === ia || n === sa || n === ra || n === aa) if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
        if (n === ia) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === sa) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === ra) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === aa) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
      if (n === oa || n === la || n === ca) if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
        if (n === oa || n === la) return a === Kt ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === ca) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
      if (n === ha || n === ua || n === da || n === fa || n === pa || n === ma || n === ga || n === _a || n === va || n === xa || n === Ma || n === Sa || n === ya || n === Ea) if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === ha) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === ua) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === da) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === fa) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === pa) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === ma) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === ga) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === _a) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === va) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === xa) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === Ma) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Sa) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === ya) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === Ea) return a === Kt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
      if (n === Ws || n === ba || n === Ta) if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === Ws) return a === Kt ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === ba) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === Ta) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
      if (n === Fc || n === Aa || n === wa || n === Ca) if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
        if (n === Ws) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === Aa) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === wa) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === Ca) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
      return n === Ci ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
    }
    return {
      convert: e
    };
  }
  class N_ extends De {
    constructor(t = []) {
      super(), this.isArrayCamera = true, this.cameras = t;
    }
  }
  class Cn extends ve {
    constructor() {
      super(), this.isGroup = true, this.type = "Group";
    }
  }
  const F_ = {
    type: "move"
  };
  class Lr {
    constructor() {
      this._targetRay = null, this._grip = null, this._hand = null;
    }
    getHandSpace() {
      return this._hand === null && (this._hand = new Cn(), this._hand.matrixAutoUpdate = false, this._hand.visible = false, this._hand.joints = {}, this._hand.inputState = {
        pinching: false
      }), this._hand;
    }
    getTargetRaySpace() {
      return this._targetRay === null && (this._targetRay = new Cn(), this._targetRay.matrixAutoUpdate = false, this._targetRay.visible = false, this._targetRay.hasLinearVelocity = false, this._targetRay.linearVelocity = new R(), this._targetRay.hasAngularVelocity = false, this._targetRay.angularVelocity = new R()), this._targetRay;
    }
    getGripSpace() {
      return this._grip === null && (this._grip = new Cn(), this._grip.matrixAutoUpdate = false, this._grip.visible = false, this._grip.hasLinearVelocity = false, this._grip.linearVelocity = new R(), this._grip.hasAngularVelocity = false, this._grip.angularVelocity = new R()), this._grip;
    }
    dispatchEvent(t) {
      return this._targetRay !== null && this._targetRay.dispatchEvent(t), this._grip !== null && this._grip.dispatchEvent(t), this._hand !== null && this._hand.dispatchEvent(t), this;
    }
    connect(t) {
      if (t && t.hand) {
        const e = this._hand;
        if (e) for (const n of t.hand.values()) this._getHandJoint(e, n);
      }
      return this.dispatchEvent({
        type: "connected",
        data: t
      }), this;
    }
    disconnect(t) {
      return this.dispatchEvent({
        type: "disconnected",
        data: t
      }), this._targetRay !== null && (this._targetRay.visible = false), this._grip !== null && (this._grip.visible = false), this._hand !== null && (this._hand.visible = false), this;
    }
    update(t, e, n) {
      let s = null, r = null, a = null;
      const o = this._targetRay, l = this._grip, c = this._hand;
      if (t && e.session.visibilityState !== "visible-blurred") {
        if (c && t.hand) {
          a = true;
          for (const v of t.hand.values()) {
            const m = e.getJointPose(v, n), u = this._getHandJoint(c, v);
            m !== null && (u.matrix.fromArray(m.transform.matrix), u.matrix.decompose(u.position, u.rotation, u.scale), u.matrixWorldNeedsUpdate = true, u.jointRadius = m.radius), u.visible = m !== null;
          }
          const h = c.joints["index-finger-tip"], d = c.joints["thumb-tip"], f = h.position.distanceTo(d.position), p = 0.02, g = 5e-3;
          c.inputState.pinching && f > p + g ? (c.inputState.pinching = false, this.dispatchEvent({
            type: "pinchend",
            handedness: t.handedness,
            target: this
          })) : !c.inputState.pinching && f <= p - g && (c.inputState.pinching = true, this.dispatchEvent({
            type: "pinchstart",
            handedness: t.handedness,
            target: this
          }));
        } else l !== null && t.gripSpace && (r = e.getPose(t.gripSpace, n), r !== null && (l.matrix.fromArray(r.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = true, r.linearVelocity ? (l.hasLinearVelocity = true, l.linearVelocity.copy(r.linearVelocity)) : l.hasLinearVelocity = false, r.angularVelocity ? (l.hasAngularVelocity = true, l.angularVelocity.copy(r.angularVelocity)) : l.hasAngularVelocity = false));
        o !== null && (s = e.getPose(t.targetRaySpace, n), s === null && r !== null && (s = r), s !== null && (o.matrix.fromArray(s.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = true, s.linearVelocity ? (o.hasLinearVelocity = true, o.linearVelocity.copy(s.linearVelocity)) : o.hasLinearVelocity = false, s.angularVelocity ? (o.hasAngularVelocity = true, o.angularVelocity.copy(s.angularVelocity)) : o.hasAngularVelocity = false, this.dispatchEvent(F_)));
      }
      return o !== null && (o.visible = s !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = a !== null), this;
    }
    _getHandJoint(t, e) {
      if (t.joints[e.jointName] === void 0) {
        const n = new Cn();
        n.matrixAutoUpdate = false, n.visible = false, t.joints[e.jointName] = n, t.add(n);
      }
      return t.joints[e.jointName];
    }
  }
  const O_ = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, B_ = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
  class z_ {
    constructor() {
      this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
    }
    init(t, e, n) {
      if (this.texture === null) {
        const s = new we(), r = t.properties.get(s);
        r.__webglTexture = e.texture, (e.depthNear != n.depthNear || e.depthFar != n.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = s;
      }
    }
    getMesh(t) {
      if (this.texture !== null && this.mesh === null) {
        const e = t.cameras[0].viewport, n = new de({
          vertexShader: O_,
          fragmentShader: B_,
          uniforms: {
            depthColor: {
              value: this.texture
            },
            depthWidth: {
              value: e.z
            },
            depthHeight: {
              value: e.w
            }
          }
        });
        this.mesh = new _e(new Ui(20, 20), n);
      }
      return this.mesh;
    }
    reset() {
      this.texture = null, this.mesh = null;
    }
    getDepthTexture() {
      return this.texture;
    }
  }
  class k_ extends jn {
    constructor(t, e) {
      super();
      const n = this;
      let s = null, r = 1, a = null, o = "local-floor", l = 1, c = null, h = null, d = null, f = null, p = null, g = null;
      const v = new z_(), m = e.getContextAttributes();
      let u = null, b = null;
      const E = [], S = [], N = new _t();
      let A = null;
      const w = new De();
      w.viewport = new Jt();
      const P = new De();
      P.viewport = new Jt();
      const y = [
        w,
        P
      ], x = new N_();
      let C = null, k = null;
      this.cameraAutoUpdate = true, this.enabled = false, this.isPresenting = false, this.getController = function(Y) {
        let et = E[Y];
        return et === void 0 && (et = new Lr(), E[Y] = et), et.getTargetRaySpace();
      }, this.getControllerGrip = function(Y) {
        let et = E[Y];
        return et === void 0 && (et = new Lr(), E[Y] = et), et.getGripSpace();
      }, this.getHand = function(Y) {
        let et = E[Y];
        return et === void 0 && (et = new Lr(), E[Y] = et), et.getHandSpace();
      };
      function z(Y) {
        const et = S.indexOf(Y.inputSource);
        if (et === -1) return;
        const vt = E[et];
        vt !== void 0 && (vt.update(Y.inputSource, Y.frame, c || a), vt.dispatchEvent({
          type: Y.type,
          data: Y.inputSource
        }));
      }
      function V() {
        s.removeEventListener("select", z), s.removeEventListener("selectstart", z), s.removeEventListener("selectend", z), s.removeEventListener("squeeze", z), s.removeEventListener("squeezestart", z), s.removeEventListener("squeezeend", z), s.removeEventListener("end", V), s.removeEventListener("inputsourceschange", Z);
        for (let Y = 0; Y < E.length; Y++) {
          const et = S[Y];
          et !== null && (S[Y] = null, E[Y].disconnect(et));
        }
        C = null, k = null, v.reset(), t.setRenderTarget(u), p = null, f = null, d = null, s = null, b = null, Qt.stop(), n.isPresenting = false, t.setPixelRatio(A), t.setSize(N.width, N.height, false), n.dispatchEvent({
          type: "sessionend"
        });
      }
      this.setFramebufferScaleFactor = function(Y) {
        r = Y, n.isPresenting === true && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
      }, this.setReferenceSpaceType = function(Y) {
        o = Y, n.isPresenting === true && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
      }, this.getReferenceSpace = function() {
        return c || a;
      }, this.setReferenceSpace = function(Y) {
        c = Y;
      }, this.getBaseLayer = function() {
        return f !== null ? f : p;
      }, this.getBinding = function() {
        return d;
      }, this.getFrame = function() {
        return g;
      }, this.getSession = function() {
        return s;
      }, this.setSession = async function(Y) {
        if (s = Y, s !== null) {
          if (u = t.getRenderTarget(), s.addEventListener("select", z), s.addEventListener("selectstart", z), s.addEventListener("selectend", z), s.addEventListener("squeeze", z), s.addEventListener("squeezestart", z), s.addEventListener("squeezeend", z), s.addEventListener("end", V), s.addEventListener("inputsourceschange", Z), m.xrCompatible !== true && await e.makeXRCompatible(), A = t.getPixelRatio(), t.getSize(N), s.renderState.layers === void 0) {
            const et = {
              antialias: m.antialias,
              alpha: true,
              depth: m.depth,
              stencil: m.stencil,
              framebufferScaleFactor: r
            };
            p = new XRWebGLLayer(s, e, et), s.updateRenderState({
              baseLayer: p
            }), t.setPixelRatio(1), t.setSize(p.framebufferWidth, p.framebufferHeight, false), b = new Ze(p.framebufferWidth, p.framebufferHeight, {
              format: je,
              type: gn,
              colorSpace: t.outputColorSpace,
              stencilBuffer: m.stencil
            });
          } else {
            let et = null, vt = null, rt = null;
            m.depth && (rt = m.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, et = m.stencil ? Ri : yi, vt = m.stencil ? Ci : Xn);
            const At = {
              colorFormat: e.RGBA8,
              depthFormat: rt,
              scaleFactor: r
            };
            d = new XRWebGLBinding(s, e), f = d.createProjectionLayer(At), s.updateRenderState({
              layers: [
                f
              ]
            }), t.setPixelRatio(1), t.setSize(f.textureWidth, f.textureHeight, false), b = new Ze(f.textureWidth, f.textureHeight, {
              format: je,
              type: gn,
              depthTexture: new $c(f.textureWidth, f.textureHeight, vt, void 0, void 0, void 0, void 0, void 0, void 0, et),
              stencilBuffer: m.stencil,
              colorSpace: t.outputColorSpace,
              samples: m.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === false
            });
          }
          b.isXRRenderTarget = true, this.setFoveation(l), c = null, a = await s.requestReferenceSpace(o), Qt.setContext(s), Qt.start(), n.isPresenting = true, n.dispatchEvent({
            type: "sessionstart"
          });
        }
      }, this.getEnvironmentBlendMode = function() {
        if (s !== null) return s.environmentBlendMode;
      }, this.getDepthTexture = function() {
        return v.getDepthTexture();
      };
      function Z(Y) {
        for (let et = 0; et < Y.removed.length; et++) {
          const vt = Y.removed[et], rt = S.indexOf(vt);
          rt >= 0 && (S[rt] = null, E[rt].disconnect(vt));
        }
        for (let et = 0; et < Y.added.length; et++) {
          const vt = Y.added[et];
          let rt = S.indexOf(vt);
          if (rt === -1) {
            for (let Dt = 0; Dt < E.length; Dt++) if (Dt >= S.length) {
              S.push(vt), rt = Dt;
              break;
            } else if (S[Dt] === null) {
              S[Dt] = vt, rt = Dt;
              break;
            }
            if (rt === -1) break;
          }
          const At = E[rt];
          At && At.connect(vt);
        }
      }
      const W = new R(), tt = new R();
      function G(Y, et, vt) {
        W.setFromMatrixPosition(et.matrixWorld), tt.setFromMatrixPosition(vt.matrixWorld);
        const rt = W.distanceTo(tt), At = et.projectionMatrix.elements, Dt = vt.projectionMatrix.elements, Bt = At[14] / (At[10] - 1), re = At[14] / (At[10] + 1), Vt = (At[9] + 1) / At[5], le = (At[9] - 1) / At[5], U = (At[8] - 1) / At[0], Be = (Dt[8] + 1) / Dt[0], zt = Bt * U, kt = Bt * Be, Et = rt / (-U + Be), ne = Et * -U;
        if (et.matrixWorld.decompose(Y.position, Y.quaternion, Y.scale), Y.translateX(ne), Y.translateZ(Et), Y.matrixWorld.compose(Y.position, Y.quaternion, Y.scale), Y.matrixWorldInverse.copy(Y.matrixWorld).invert(), At[10] === -1) Y.projectionMatrix.copy(et.projectionMatrix), Y.projectionMatrixInverse.copy(et.projectionMatrixInverse);
        else {
          const yt = Bt + Et, T = re + Et, _ = zt - ne, F = kt + (rt - ne), j = Vt * re / T * yt, $ = le * re / T * yt;
          Y.projectionMatrix.makePerspective(_, F, j, $, yt, T), Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert();
        }
      }
      function st(Y, et) {
        et === null ? Y.matrixWorld.copy(Y.matrix) : Y.matrixWorld.multiplyMatrices(et.matrixWorld, Y.matrix), Y.matrixWorldInverse.copy(Y.matrixWorld).invert();
      }
      this.updateCamera = function(Y) {
        if (s === null) return;
        let et = Y.near, vt = Y.far;
        v.texture !== null && (v.depthNear > 0 && (et = v.depthNear), v.depthFar > 0 && (vt = v.depthFar)), x.near = P.near = w.near = et, x.far = P.far = w.far = vt, (C !== x.near || k !== x.far) && (s.updateRenderState({
          depthNear: x.near,
          depthFar: x.far
        }), C = x.near, k = x.far), w.layers.mask = Y.layers.mask | 2, P.layers.mask = Y.layers.mask | 4, x.layers.mask = w.layers.mask | P.layers.mask;
        const rt = Y.parent, At = x.cameras;
        st(x, rt);
        for (let Dt = 0; Dt < At.length; Dt++) st(At[Dt], rt);
        At.length === 2 ? G(x, w, P) : x.projectionMatrix.copy(w.projectionMatrix), ht(Y, x, rt);
      };
      function ht(Y, et, vt) {
        vt === null ? Y.matrix.copy(et.matrixWorld) : (Y.matrix.copy(vt.matrixWorld), Y.matrix.invert(), Y.matrix.multiply(et.matrixWorld)), Y.matrix.decompose(Y.position, Y.quaternion, Y.scale), Y.updateMatrixWorld(true), Y.projectionMatrix.copy(et.projectionMatrix), Y.projectionMatrixInverse.copy(et.projectionMatrixInverse), Y.isPerspectiveCamera && (Y.fov = es * 2 * Math.atan(1 / Y.projectionMatrix.elements[5]), Y.zoom = 1);
      }
      this.getCamera = function() {
        return x;
      }, this.getFoveation = function() {
        if (!(f === null && p === null)) return l;
      }, this.setFoveation = function(Y) {
        l = Y, f !== null && (f.fixedFoveation = Y), p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = Y);
      }, this.hasDepthSensing = function() {
        return v.texture !== null;
      }, this.getDepthSensingMesh = function() {
        return v.getMesh(x);
      };
      let St = null;
      function Ot(Y, et) {
        if (h = et.getViewerPose(c || a), g = et, h !== null) {
          const vt = h.views;
          p !== null && (t.setRenderTargetFramebuffer(b, p.framebuffer), t.setRenderTarget(b));
          let rt = false;
          vt.length !== x.cameras.length && (x.cameras.length = 0, rt = true);
          for (let Dt = 0; Dt < vt.length; Dt++) {
            const Bt = vt[Dt];
            let re = null;
            if (p !== null) re = p.getViewport(Bt);
            else {
              const le = d.getViewSubImage(f, Bt);
              re = le.viewport, Dt === 0 && (t.setRenderTargetTextures(b, le.colorTexture, f.ignoreDepthValues ? void 0 : le.depthStencilTexture), t.setRenderTarget(b));
            }
            let Vt = y[Dt];
            Vt === void 0 && (Vt = new De(), Vt.layers.enable(Dt), Vt.viewport = new Jt(), y[Dt] = Vt), Vt.matrix.fromArray(Bt.transform.matrix), Vt.matrix.decompose(Vt.position, Vt.quaternion, Vt.scale), Vt.projectionMatrix.fromArray(Bt.projectionMatrix), Vt.projectionMatrixInverse.copy(Vt.projectionMatrix).invert(), Vt.viewport.set(re.x, re.y, re.width, re.height), Dt === 0 && (x.matrix.copy(Vt.matrix), x.matrix.decompose(x.position, x.quaternion, x.scale)), rt === true && x.cameras.push(Vt);
          }
          const At = s.enabledFeatures;
          if (At && At.includes("depth-sensing")) {
            const Dt = d.getDepthInformation(vt[0]);
            Dt && Dt.isValid && Dt.texture && v.init(t, Dt, s.renderState);
          }
        }
        for (let vt = 0; vt < E.length; vt++) {
          const rt = S[vt], At = E[vt];
          rt !== null && At !== void 0 && At.update(rt, et, c || a);
        }
        St && St(Y, et), et.detectedPlanes && n.dispatchEvent({
          type: "planesdetected",
          data: et
        }), g = null;
      }
      const Qt = new Kc();
      Qt.setAnimationLoop(Ot), this.setAnimationLoop = function(Y) {
        St = Y;
      }, this.dispose = function() {
      };
    }
  }
  const On = new nn(), H_ = new Zt();
  function G_(i, t) {
    function e(m, u) {
      m.matrixAutoUpdate === true && m.updateMatrix(), u.value.copy(m.matrix);
    }
    function n(m, u) {
      u.color.getRGB(m.fogColor.value, qc(i)), u.isFog ? (m.fogNear.value = u.near, m.fogFar.value = u.far) : u.isFogExp2 && (m.fogDensity.value = u.density);
    }
    function s(m, u, b, E, S) {
      u.isMeshBasicMaterial || u.isMeshLambertMaterial ? r(m, u) : u.isMeshToonMaterial ? (r(m, u), d(m, u)) : u.isMeshPhongMaterial ? (r(m, u), h(m, u)) : u.isMeshStandardMaterial ? (r(m, u), f(m, u), u.isMeshPhysicalMaterial && p(m, u, S)) : u.isMeshMatcapMaterial ? (r(m, u), g(m, u)) : u.isMeshDepthMaterial ? r(m, u) : u.isMeshDistanceMaterial ? (r(m, u), v(m, u)) : u.isMeshNormalMaterial ? r(m, u) : u.isLineBasicMaterial ? (a(m, u), u.isLineDashedMaterial && o(m, u)) : u.isPointsMaterial ? l(m, u, b, E) : u.isSpriteMaterial ? c(m, u) : u.isShadowMaterial ? (m.color.value.copy(u.color), m.opacity.value = u.opacity) : u.isShaderMaterial && (u.uniformsNeedUpdate = false);
    }
    function r(m, u) {
      m.opacity.value = u.opacity, u.color && m.diffuse.value.copy(u.color), u.emissive && m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity), u.map && (m.map.value = u.map, e(u.map, m.mapTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.bumpMap && (m.bumpMap.value = u.bumpMap, e(u.bumpMap, m.bumpMapTransform), m.bumpScale.value = u.bumpScale, u.side === Ie && (m.bumpScale.value *= -1)), u.normalMap && (m.normalMap.value = u.normalMap, e(u.normalMap, m.normalMapTransform), m.normalScale.value.copy(u.normalScale), u.side === Ie && m.normalScale.value.negate()), u.displacementMap && (m.displacementMap.value = u.displacementMap, e(u.displacementMap, m.displacementMapTransform), m.displacementScale.value = u.displacementScale, m.displacementBias.value = u.displacementBias), u.emissiveMap && (m.emissiveMap.value = u.emissiveMap, e(u.emissiveMap, m.emissiveMapTransform)), u.specularMap && (m.specularMap.value = u.specularMap, e(u.specularMap, m.specularMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
      const b = t.get(u), E = b.envMap, S = b.envMapRotation;
      E && (m.envMap.value = E, On.copy(S), On.x *= -1, On.y *= -1, On.z *= -1, E.isCubeTexture && E.isRenderTargetTexture === false && (On.y *= -1, On.z *= -1), m.envMapRotation.value.setFromMatrix4(H_.makeRotationFromEuler(On)), m.flipEnvMap.value = E.isCubeTexture && E.isRenderTargetTexture === false ? -1 : 1, m.reflectivity.value = u.reflectivity, m.ior.value = u.ior, m.refractionRatio.value = u.refractionRatio), u.lightMap && (m.lightMap.value = u.lightMap, m.lightMapIntensity.value = u.lightMapIntensity, e(u.lightMap, m.lightMapTransform)), u.aoMap && (m.aoMap.value = u.aoMap, m.aoMapIntensity.value = u.aoMapIntensity, e(u.aoMap, m.aoMapTransform));
    }
    function a(m, u) {
      m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, u.map && (m.map.value = u.map, e(u.map, m.mapTransform));
    }
    function o(m, u) {
      m.dashSize.value = u.dashSize, m.totalSize.value = u.dashSize + u.gapSize, m.scale.value = u.scale;
    }
    function l(m, u, b, E) {
      m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, m.size.value = u.size * b, m.scale.value = E * 0.5, u.map && (m.map.value = u.map, e(u.map, m.uvTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
    }
    function c(m, u) {
      m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, m.rotation.value = u.rotation, u.map && (m.map.value = u.map, e(u.map, m.mapTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
    }
    function h(m, u) {
      m.specular.value.copy(u.specular), m.shininess.value = Math.max(u.shininess, 1e-4);
    }
    function d(m, u) {
      u.gradientMap && (m.gradientMap.value = u.gradientMap);
    }
    function f(m, u) {
      m.metalness.value = u.metalness, u.metalnessMap && (m.metalnessMap.value = u.metalnessMap, e(u.metalnessMap, m.metalnessMapTransform)), m.roughness.value = u.roughness, u.roughnessMap && (m.roughnessMap.value = u.roughnessMap, e(u.roughnessMap, m.roughnessMapTransform)), u.envMap && (m.envMapIntensity.value = u.envMapIntensity);
    }
    function p(m, u, b) {
      m.ior.value = u.ior, u.sheen > 0 && (m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen), m.sheenRoughness.value = u.sheenRoughness, u.sheenColorMap && (m.sheenColorMap.value = u.sheenColorMap, e(u.sheenColorMap, m.sheenColorMapTransform)), u.sheenRoughnessMap && (m.sheenRoughnessMap.value = u.sheenRoughnessMap, e(u.sheenRoughnessMap, m.sheenRoughnessMapTransform))), u.clearcoat > 0 && (m.clearcoat.value = u.clearcoat, m.clearcoatRoughness.value = u.clearcoatRoughness, u.clearcoatMap && (m.clearcoatMap.value = u.clearcoatMap, e(u.clearcoatMap, m.clearcoatMapTransform)), u.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = u.clearcoatRoughnessMap, e(u.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), u.clearcoatNormalMap && (m.clearcoatNormalMap.value = u.clearcoatNormalMap, e(u.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale), u.side === Ie && m.clearcoatNormalScale.value.negate())), u.dispersion > 0 && (m.dispersion.value = u.dispersion), u.iridescence > 0 && (m.iridescence.value = u.iridescence, m.iridescenceIOR.value = u.iridescenceIOR, m.iridescenceThicknessMinimum.value = u.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = u.iridescenceThicknessRange[1], u.iridescenceMap && (m.iridescenceMap.value = u.iridescenceMap, e(u.iridescenceMap, m.iridescenceMapTransform)), u.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = u.iridescenceThicknessMap, e(u.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), u.transmission > 0 && (m.transmission.value = u.transmission, m.transmissionSamplerMap.value = b.texture, m.transmissionSamplerSize.value.set(b.width, b.height), u.transmissionMap && (m.transmissionMap.value = u.transmissionMap, e(u.transmissionMap, m.transmissionMapTransform)), m.thickness.value = u.thickness, u.thicknessMap && (m.thicknessMap.value = u.thicknessMap, e(u.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = u.attenuationDistance, m.attenuationColor.value.copy(u.attenuationColor)), u.anisotropy > 0 && (m.anisotropyVector.value.set(u.anisotropy * Math.cos(u.anisotropyRotation), u.anisotropy * Math.sin(u.anisotropyRotation)), u.anisotropyMap && (m.anisotropyMap.value = u.anisotropyMap, e(u.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = u.specularIntensity, m.specularColor.value.copy(u.specularColor), u.specularColorMap && (m.specularColorMap.value = u.specularColorMap, e(u.specularColorMap, m.specularColorMapTransform)), u.specularIntensityMap && (m.specularIntensityMap.value = u.specularIntensityMap, e(u.specularIntensityMap, m.specularIntensityMapTransform));
    }
    function g(m, u) {
      u.matcap && (m.matcap.value = u.matcap);
    }
    function v(m, u) {
      const b = t.get(u).light;
      m.referencePosition.value.setFromMatrixPosition(b.matrixWorld), m.nearDistance.value = b.shadow.camera.near, m.farDistance.value = b.shadow.camera.far;
    }
    return {
      refreshFogUniforms: n,
      refreshMaterialUniforms: s
    };
  }
  function V_(i, t, e, n) {
    let s = {}, r = {}, a = [];
    const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
    function l(b, E) {
      const S = E.program;
      n.uniformBlockBinding(b, S);
    }
    function c(b, E) {
      let S = s[b.id];
      S === void 0 && (g(b), S = h(b), s[b.id] = S, b.addEventListener("dispose", m));
      const N = E.program;
      n.updateUBOMapping(b, N);
      const A = t.render.frame;
      r[b.id] !== A && (f(b), r[b.id] = A);
    }
    function h(b) {
      const E = d();
      b.__bindingPointIndex = E;
      const S = i.createBuffer(), N = b.__size, A = b.usage;
      return i.bindBuffer(i.UNIFORM_BUFFER, S), i.bufferData(i.UNIFORM_BUFFER, N, A), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, E, S), S;
    }
    function d() {
      for (let b = 0; b < o; b++) if (a.indexOf(b) === -1) return a.push(b), b;
      return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
    }
    function f(b) {
      const E = s[b.id], S = b.uniforms, N = b.__cache;
      i.bindBuffer(i.UNIFORM_BUFFER, E);
      for (let A = 0, w = S.length; A < w; A++) {
        const P = Array.isArray(S[A]) ? S[A] : [
          S[A]
        ];
        for (let y = 0, x = P.length; y < x; y++) {
          const C = P[y];
          if (p(C, A, y, N) === true) {
            const k = C.__offset, z = Array.isArray(C.value) ? C.value : [
              C.value
            ];
            let V = 0;
            for (let Z = 0; Z < z.length; Z++) {
              const W = z[Z], tt = v(W);
              typeof W == "number" || typeof W == "boolean" ? (C.__data[0] = W, i.bufferSubData(i.UNIFORM_BUFFER, k + V, C.__data)) : W.isMatrix3 ? (C.__data[0] = W.elements[0], C.__data[1] = W.elements[1], C.__data[2] = W.elements[2], C.__data[3] = 0, C.__data[4] = W.elements[3], C.__data[5] = W.elements[4], C.__data[6] = W.elements[5], C.__data[7] = 0, C.__data[8] = W.elements[6], C.__data[9] = W.elements[7], C.__data[10] = W.elements[8], C.__data[11] = 0) : (W.toArray(C.__data, V), V += tt.storage / Float32Array.BYTES_PER_ELEMENT);
            }
            i.bufferSubData(i.UNIFORM_BUFFER, k, C.__data);
          }
        }
      }
      i.bindBuffer(i.UNIFORM_BUFFER, null);
    }
    function p(b, E, S, N) {
      const A = b.value, w = E + "_" + S;
      if (N[w] === void 0) return typeof A == "number" || typeof A == "boolean" ? N[w] = A : N[w] = A.clone(), true;
      {
        const P = N[w];
        if (typeof A == "number" || typeof A == "boolean") {
          if (P !== A) return N[w] = A, true;
        } else if (P.equals(A) === false) return P.copy(A), true;
      }
      return false;
    }
    function g(b) {
      const E = b.uniforms;
      let S = 0;
      const N = 16;
      for (let w = 0, P = E.length; w < P; w++) {
        const y = Array.isArray(E[w]) ? E[w] : [
          E[w]
        ];
        for (let x = 0, C = y.length; x < C; x++) {
          const k = y[x], z = Array.isArray(k.value) ? k.value : [
            k.value
          ];
          for (let V = 0, Z = z.length; V < Z; V++) {
            const W = z[V], tt = v(W), G = S % N, st = G % tt.boundary, ht = G + st;
            S += st, ht !== 0 && N - ht < tt.storage && (S += N - ht), k.__data = new Float32Array(tt.storage / Float32Array.BYTES_PER_ELEMENT), k.__offset = S, S += tt.storage;
          }
        }
      }
      const A = S % N;
      return A > 0 && (S += N - A), b.__size = S, b.__cache = {}, this;
    }
    function v(b) {
      const E = {
        boundary: 0,
        storage: 0
      };
      return typeof b == "number" || typeof b == "boolean" ? (E.boundary = 4, E.storage = 4) : b.isVector2 ? (E.boundary = 8, E.storage = 8) : b.isVector3 || b.isColor ? (E.boundary = 16, E.storage = 12) : b.isVector4 ? (E.boundary = 16, E.storage = 16) : b.isMatrix3 ? (E.boundary = 48, E.storage = 48) : b.isMatrix4 ? (E.boundary = 64, E.storage = 64) : b.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", b), E;
    }
    function m(b) {
      const E = b.target;
      E.removeEventListener("dispose", m);
      const S = a.indexOf(E.__bindingPointIndex);
      a.splice(S, 1), i.deleteBuffer(s[E.id]), delete s[E.id], delete r[E.id];
    }
    function u() {
      for (const b in s) i.deleteBuffer(s[b]);
      a = [], s = {}, r = {};
    }
    return {
      bind: l,
      update: c,
      dispose: u
    };
  }
  class W_ {
    constructor(t = {}) {
      const { canvas: e = Id(), context: n = null, depth: s = true, stencil: r = false, alpha: a = false, antialias: o = false, premultipliedAlpha: l = true, preserveDrawingBuffer: c = false, powerPreference: h = "default", failIfMajorPerformanceCaveat: d = false, reverseDepthBuffer: f = false } = t;
      this.isWebGLRenderer = true;
      let p;
      if (n !== null) {
        if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
        p = n.getContextAttributes().alpha;
      } else p = a;
      const g = new Uint32Array(4), v = new Int32Array(4);
      let m = null, u = null;
      const b = [], E = [];
      this.domElement = e, this.debug = {
        checkShaderErrors: true,
        onShaderError: null
      }, this.autoClear = true, this.autoClearColor = true, this.autoClearDepth = true, this.autoClearStencil = true, this.sortObjects = true, this.clippingPlanes = [], this.localClippingEnabled = false, this._outputColorSpace = Fe, this.toneMapping = Rn, this.toneMappingExposure = 1;
      const S = this;
      let N = false, A = 0, w = 0, P = null, y = -1, x = null;
      const C = new Jt(), k = new Jt();
      let z = null;
      const V = new Pt(0);
      let Z = 0, W = e.width, tt = e.height, G = 1, st = null, ht = null;
      const St = new Jt(0, 0, W, tt), Ot = new Jt(0, 0, W, tt);
      let Qt = false;
      const Y = new ja();
      let et = false, vt = false;
      const rt = new Zt(), At = new Zt(), Dt = new R(), Bt = new Jt(), re = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: true
      };
      let Vt = false;
      function le() {
        return P === null ? G : 1;
      }
      let U = n;
      function Be(M, I) {
        return e.getContext(M, I);
      }
      try {
        const M = {
          alpha: true,
          depth: s,
          stencil: r,
          antialias: o,
          premultipliedAlpha: l,
          preserveDrawingBuffer: c,
          powerPreference: h,
          failIfMajorPerformanceCaveat: d
        };
        if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${Oa}`), e.addEventListener("webglcontextlost", K, false), e.addEventListener("webglcontextrestored", ct, false), e.addEventListener("webglcontextcreationerror", ot, false), U === null) {
          const I = "webgl2";
          if (U = Be(I, M), U === null) throw Be(I) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
        }
      } catch (M) {
        throw console.error("THREE.WebGLRenderer: " + M.message), M;
      }
      let zt, kt, Et, ne, yt, T, _, F, j, $, q, xt, at, ut, Wt, J, dt, bt, Ct, ft, Ht, Nt, te, D;
      function it() {
        zt = new Km(U), zt.init(), Nt = new U_(U, zt), kt = new Vm(U, zt, t, Nt), Et = new D_(U, zt), kt.reverseDepthBuffer && f && Et.buffers.depth.setReversed(true), ne = new Jm(U), yt = new g_(), T = new L_(U, zt, Et, yt, kt, Nt, ne), _ = new Xm(S), F = new jm(S), j = new rf(U), te = new Hm(U, j), $ = new Zm(U, j, ne, te), q = new tg(U, $, j, ne), Ct = new Qm(U, kt, T), J = new Wm(yt), xt = new m_(S, _, F, zt, kt, te, J), at = new G_(S, yt), ut = new v_(), Wt = new b_(zt), bt = new km(S, _, F, Et, q, p, l), dt = new R_(S, q, kt), D = new V_(U, ne, kt, Et), ft = new Gm(U, zt, ne), Ht = new $m(U, zt, ne), ne.programs = xt.programs, S.capabilities = kt, S.extensions = zt, S.properties = yt, S.renderLists = ut, S.shadowMap = dt, S.state = Et, S.info = ne;
      }
      it();
      const H = new k_(S, U);
      this.xr = H, this.getContext = function() {
        return U;
      }, this.getContextAttributes = function() {
        return U.getContextAttributes();
      }, this.forceContextLoss = function() {
        const M = zt.get("WEBGL_lose_context");
        M && M.loseContext();
      }, this.forceContextRestore = function() {
        const M = zt.get("WEBGL_lose_context");
        M && M.restoreContext();
      }, this.getPixelRatio = function() {
        return G;
      }, this.setPixelRatio = function(M) {
        M !== void 0 && (G = M, this.setSize(W, tt, false));
      }, this.getSize = function(M) {
        return M.set(W, tt);
      }, this.setSize = function(M, I, O = true) {
        if (H.isPresenting) {
          console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
          return;
        }
        W = M, tt = I, e.width = Math.floor(M * G), e.height = Math.floor(I * G), O === true && (e.style.width = M + "px", e.style.height = I + "px"), this.setViewport(0, 0, M, I);
      }, this.getDrawingBufferSize = function(M) {
        return M.set(W * G, tt * G).floor();
      }, this.setDrawingBufferSize = function(M, I, O) {
        W = M, tt = I, G = O, e.width = Math.floor(M * O), e.height = Math.floor(I * O), this.setViewport(0, 0, M, I);
      }, this.getCurrentViewport = function(M) {
        return M.copy(C);
      }, this.getViewport = function(M) {
        return M.copy(St);
      }, this.setViewport = function(M, I, O, B) {
        M.isVector4 ? St.set(M.x, M.y, M.z, M.w) : St.set(M, I, O, B), Et.viewport(C.copy(St).multiplyScalar(G).round());
      }, this.getScissor = function(M) {
        return M.copy(Ot);
      }, this.setScissor = function(M, I, O, B) {
        M.isVector4 ? Ot.set(M.x, M.y, M.z, M.w) : Ot.set(M, I, O, B), Et.scissor(k.copy(Ot).multiplyScalar(G).round());
      }, this.getScissorTest = function() {
        return Qt;
      }, this.setScissorTest = function(M) {
        Et.setScissorTest(Qt = M);
      }, this.setOpaqueSort = function(M) {
        st = M;
      }, this.setTransparentSort = function(M) {
        ht = M;
      }, this.getClearColor = function(M) {
        return M.copy(bt.getClearColor());
      }, this.setClearColor = function() {
        bt.setClearColor.apply(bt, arguments);
      }, this.getClearAlpha = function() {
        return bt.getClearAlpha();
      }, this.setClearAlpha = function() {
        bt.setClearAlpha.apply(bt, arguments);
      }, this.clear = function(M = true, I = true, O = true) {
        let B = 0;
        if (M) {
          let L = false;
          if (P !== null) {
            const Q = P.texture.format;
            L = Q === Xa || Q === Wa || Q === Va;
          }
          if (L) {
            const Q = P.texture.type, lt = Q === gn || Q === Xn || Q === ts || Q === Ci || Q === ka || Q === Ha, pt = bt.getClearColor(), mt = bt.getClearAlpha(), Rt = pt.r, Lt = pt.g, gt = pt.b;
            lt ? (g[0] = Rt, g[1] = Lt, g[2] = gt, g[3] = mt, U.clearBufferuiv(U.COLOR, 0, g)) : (v[0] = Rt, v[1] = Lt, v[2] = gt, v[3] = mt, U.clearBufferiv(U.COLOR, 0, v));
          } else B |= U.COLOR_BUFFER_BIT;
        }
        I && (B |= U.DEPTH_BUFFER_BIT), O && (B |= U.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), U.clear(B);
      }, this.clearColor = function() {
        this.clear(true, false, false);
      }, this.clearDepth = function() {
        this.clear(false, true, false);
      }, this.clearStencil = function() {
        this.clear(false, false, true);
      }, this.dispose = function() {
        e.removeEventListener("webglcontextlost", K, false), e.removeEventListener("webglcontextrestored", ct, false), e.removeEventListener("webglcontextcreationerror", ot, false), ut.dispose(), Wt.dispose(), yt.dispose(), _.dispose(), F.dispose(), q.dispose(), te.dispose(), D.dispose(), xt.dispose(), H.dispose(), H.removeEventListener("sessionstart", no), H.removeEventListener("sessionend", io), Dn.stop();
      };
      function K(M) {
        M.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), N = true;
      }
      function ct() {
        console.log("THREE.WebGLRenderer: Context Restored."), N = false;
        const M = ne.autoReset, I = dt.enabled, O = dt.autoUpdate, B = dt.needsUpdate, L = dt.type;
        it(), ne.autoReset = M, dt.enabled = I, dt.autoUpdate = O, dt.needsUpdate = B, dt.type = L;
      }
      function ot(M) {
        console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", M.statusMessage);
      }
      function It(M) {
        const I = M.target;
        I.removeEventListener("dispose", It), ae(I);
      }
      function ae(M) {
        Me(M), yt.remove(M);
      }
      function Me(M) {
        const I = yt.get(M).programs;
        I !== void 0 && (I.forEach(function(O) {
          xt.releaseProgram(O);
        }), M.isShaderMaterial && xt.releaseShaderCache(M));
      }
      this.renderBufferDirect = function(M, I, O, B, L, Q) {
        I === null && (I = re);
        const lt = L.isMesh && L.matrixWorld.determinant() < 0, pt = xh(M, I, O, B, L);
        Et.setMaterial(B, lt);
        let mt = O.index, Rt = 1;
        if (B.wireframe === true) {
          if (mt = $.getWireframeAttribute(O), mt === void 0) return;
          Rt = 2;
        }
        const Lt = O.drawRange, gt = O.attributes.position;
        let Xt = Lt.start * Rt, ee = (Lt.start + Lt.count) * Rt;
        Q !== null && (Xt = Math.max(Xt, Q.start * Rt), ee = Math.min(ee, (Q.start + Q.count) * Rt)), mt !== null ? (Xt = Math.max(Xt, 0), ee = Math.min(ee, mt.count)) : gt != null && (Xt = Math.max(Xt, 0), ee = Math.min(ee, gt.count));
        const ie = ee - Xt;
        if (ie < 0 || ie === 1 / 0) return;
        te.setup(L, B, pt, O, mt);
        let Ce, qt = ft;
        if (mt !== null && (Ce = j.get(mt), qt = Ht, qt.setIndex(Ce)), L.isMesh) B.wireframe === true ? (Et.setLineWidth(B.wireframeLinewidth * le()), qt.setMode(U.LINES)) : qt.setMode(U.TRIANGLES);
        else if (L.isLine) {
          let Mt = B.linewidth;
          Mt === void 0 && (Mt = 1), Et.setLineWidth(Mt * le()), L.isLineSegments ? qt.setMode(U.LINES) : L.isLineLoop ? qt.setMode(U.LINE_LOOP) : qt.setMode(U.LINE_STRIP);
        } else L.isPoints ? qt.setMode(U.POINTS) : L.isSprite && qt.setMode(U.TRIANGLES);
        if (L.isBatchedMesh) if (L._multiDrawInstances !== null) qt.renderMultiDrawInstances(L._multiDrawStarts, L._multiDrawCounts, L._multiDrawCount, L._multiDrawInstances);
        else if (zt.get("WEBGL_multi_draw")) qt.renderMultiDraw(L._multiDrawStarts, L._multiDrawCounts, L._multiDrawCount);
        else {
          const Mt = L._multiDrawStarts, rn = L._multiDrawCounts, Yt = L._multiDrawCount, Ge = mt ? j.get(mt).bytesPerElement : 1, Jn = yt.get(B).currentProgram.getUniforms();
          for (let Le = 0; Le < Yt; Le++) Jn.setValue(U, "_gl_DrawID", Le), qt.render(Mt[Le] / Ge, rn[Le]);
        }
        else if (L.isInstancedMesh) qt.renderInstances(Xt, ie, L.count);
        else if (O.isInstancedBufferGeometry) {
          const Mt = O._maxInstanceCount !== void 0 ? O._maxInstanceCount : 1 / 0, rn = Math.min(O.instanceCount, Mt);
          qt.renderInstances(Xt, ie, rn);
        } else qt.render(Xt, ie);
      };
      function jt(M, I, O) {
        M.transparent === true && M.side === qe && M.forceSinglePass === false ? (M.side = Ie, M.needsUpdate = true, os(M, I, O), M.side = Pn, M.needsUpdate = true, os(M, I, O), M.side = qe) : os(M, I, O);
      }
      this.compile = function(M, I, O = null) {
        O === null && (O = M), u = Wt.get(O), u.init(I), E.push(u), O.traverseVisible(function(L) {
          L.isLight && L.layers.test(I.layers) && (u.pushLight(L), L.castShadow && u.pushShadow(L));
        }), M !== O && M.traverseVisible(function(L) {
          L.isLight && L.layers.test(I.layers) && (u.pushLight(L), L.castShadow && u.pushShadow(L));
        }), u.setupLights();
        const B = /* @__PURE__ */ new Set();
        return M.traverse(function(L) {
          if (!(L.isMesh || L.isPoints || L.isLine || L.isSprite)) return;
          const Q = L.material;
          if (Q) if (Array.isArray(Q)) for (let lt = 0; lt < Q.length; lt++) {
            const pt = Q[lt];
            jt(pt, O, L), B.add(pt);
          }
          else jt(Q, O, L), B.add(Q);
        }), E.pop(), u = null, B;
      }, this.compileAsync = function(M, I, O = null) {
        const B = this.compile(M, I, O);
        return new Promise((L) => {
          function Q() {
            if (B.forEach(function(lt) {
              yt.get(lt).currentProgram.isReady() && B.delete(lt);
            }), B.size === 0) {
              L(M);
              return;
            }
            setTimeout(Q, 10);
          }
          zt.get("KHR_parallel_shader_compile") !== null ? Q() : setTimeout(Q, 10);
        });
      };
      let He = null;
      function sn(M) {
        He && He(M);
      }
      function no() {
        Dn.stop();
      }
      function io() {
        Dn.start();
      }
      const Dn = new Kc();
      Dn.setAnimationLoop(sn), typeof self < "u" && Dn.setContext(self), this.setAnimationLoop = function(M) {
        He = M, H.setAnimationLoop(M), M === null ? Dn.stop() : Dn.start();
      }, H.addEventListener("sessionstart", no), H.addEventListener("sessionend", io), this.render = function(M, I) {
        if (I !== void 0 && I.isCamera !== true) {
          console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
          return;
        }
        if (N === true) return;
        if (M.matrixWorldAutoUpdate === true && M.updateMatrixWorld(), I.parent === null && I.matrixWorldAutoUpdate === true && I.updateMatrixWorld(), H.enabled === true && H.isPresenting === true && (H.cameraAutoUpdate === true && H.updateCamera(I), I = H.getCamera()), M.isScene === true && M.onBeforeRender(S, M, I, P), u = Wt.get(M, E.length), u.init(I), E.push(u), At.multiplyMatrices(I.projectionMatrix, I.matrixWorldInverse), Y.setFromProjectionMatrix(At), vt = this.localClippingEnabled, et = J.init(this.clippingPlanes, vt), m = ut.get(M, b.length), m.init(), b.push(m), H.enabled === true && H.isPresenting === true) {
          const Q = S.xr.getDepthSensingMesh();
          Q !== null && er(Q, I, -1 / 0, S.sortObjects);
        }
        er(M, I, 0, S.sortObjects), m.finish(), S.sortObjects === true && m.sort(st, ht), Vt = H.enabled === false || H.isPresenting === false || H.hasDepthSensing() === false, Vt && bt.addToRenderList(m, M), this.info.render.frame++, et === true && J.beginShadows();
        const O = u.state.shadowsArray;
        dt.render(O, M, I), et === true && J.endShadows(), this.info.autoReset === true && this.info.reset();
        const B = m.opaque, L = m.transmissive;
        if (u.setupLights(), I.isArrayCamera) {
          const Q = I.cameras;
          if (L.length > 0) for (let lt = 0, pt = Q.length; lt < pt; lt++) {
            const mt = Q[lt];
            ro(B, L, M, mt);
          }
          Vt && bt.render(M);
          for (let lt = 0, pt = Q.length; lt < pt; lt++) {
            const mt = Q[lt];
            so(m, M, mt, mt.viewport);
          }
        } else L.length > 0 && ro(B, L, M, I), Vt && bt.render(M), so(m, M, I);
        P !== null && (T.updateMultisampleRenderTarget(P), T.updateRenderTargetMipmap(P)), M.isScene === true && M.onAfterRender(S, M, I), te.resetDefaultState(), y = -1, x = null, E.pop(), E.length > 0 ? (u = E[E.length - 1], et === true && J.setGlobalState(S.clippingPlanes, u.state.camera)) : u = null, b.pop(), b.length > 0 ? m = b[b.length - 1] : m = null;
      };
      function er(M, I, O, B) {
        if (M.visible === false) return;
        if (M.layers.test(I.layers)) {
          if (M.isGroup) O = M.renderOrder;
          else if (M.isLOD) M.autoUpdate === true && M.update(I);
          else if (M.isLight) u.pushLight(M), M.castShadow && u.pushShadow(M);
          else if (M.isSprite) {
            if (!M.frustumCulled || Y.intersectsSprite(M)) {
              B && Bt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(At);
              const lt = q.update(M), pt = M.material;
              pt.visible && m.push(M, lt, pt, O, Bt.z, null);
            }
          } else if ((M.isMesh || M.isLine || M.isPoints) && (!M.frustumCulled || Y.intersectsObject(M))) {
            const lt = q.update(M), pt = M.material;
            if (B && (M.boundingSphere !== void 0 ? (M.boundingSphere === null && M.computeBoundingSphere(), Bt.copy(M.boundingSphere.center)) : (lt.boundingSphere === null && lt.computeBoundingSphere(), Bt.copy(lt.boundingSphere.center)), Bt.applyMatrix4(M.matrixWorld).applyMatrix4(At)), Array.isArray(pt)) {
              const mt = lt.groups;
              for (let Rt = 0, Lt = mt.length; Rt < Lt; Rt++) {
                const gt = mt[Rt], Xt = pt[gt.materialIndex];
                Xt && Xt.visible && m.push(M, lt, Xt, O, Bt.z, gt);
              }
            } else pt.visible && m.push(M, lt, pt, O, Bt.z, null);
          }
        }
        const Q = M.children;
        for (let lt = 0, pt = Q.length; lt < pt; lt++) er(Q[lt], I, O, B);
      }
      function so(M, I, O, B) {
        const L = M.opaque, Q = M.transmissive, lt = M.transparent;
        u.setupLightsView(O), et === true && J.setGlobalState(S.clippingPlanes, O), B && Et.viewport(C.copy(B)), L.length > 0 && as(L, I, O), Q.length > 0 && as(Q, I, O), lt.length > 0 && as(lt, I, O), Et.buffers.depth.setTest(true), Et.buffers.depth.setMask(true), Et.buffers.color.setMask(true), Et.setPolygonOffset(false);
      }
      function ro(M, I, O, B) {
        if ((O.isScene === true ? O.overrideMaterial : null) !== null) return;
        u.state.transmissionRenderTarget[B.id] === void 0 && (u.state.transmissionRenderTarget[B.id] = new Ze(1, 1, {
          generateMipmaps: true,
          type: zt.has("EXT_color_buffer_half_float") || zt.has("EXT_color_buffer_float") ? pn : gn,
          minFilter: Gn,
          samples: 4,
          stencilBuffer: r,
          resolveDepthBuffer: false,
          resolveStencilBuffer: false,
          colorSpace: Gt.workingColorSpace
        }));
        const Q = u.state.transmissionRenderTarget[B.id], lt = B.viewport || C;
        Q.setSize(lt.z, lt.w);
        const pt = S.getRenderTarget();
        S.setRenderTarget(Q), S.getClearColor(V), Z = S.getClearAlpha(), Z < 1 && S.setClearColor(16777215, 0.5), S.clear(), Vt && bt.render(O);
        const mt = S.toneMapping;
        S.toneMapping = Rn;
        const Rt = B.viewport;
        if (B.viewport !== void 0 && (B.viewport = void 0), u.setupLightsView(B), et === true && J.setGlobalState(S.clippingPlanes, B), as(M, O, B), T.updateMultisampleRenderTarget(Q), T.updateRenderTargetMipmap(Q), zt.has("WEBGL_multisampled_render_to_texture") === false) {
          let Lt = false;
          for (let gt = 0, Xt = I.length; gt < Xt; gt++) {
            const ee = I[gt], ie = ee.object, Ce = ee.geometry, qt = ee.material, Mt = ee.group;
            if (qt.side === qe && ie.layers.test(B.layers)) {
              const rn = qt.side;
              qt.side = Ie, qt.needsUpdate = true, ao(ie, O, B, Ce, qt, Mt), qt.side = rn, qt.needsUpdate = true, Lt = true;
            }
          }
          Lt === true && (T.updateMultisampleRenderTarget(Q), T.updateRenderTargetMipmap(Q));
        }
        S.setRenderTarget(pt), S.setClearColor(V, Z), Rt !== void 0 && (B.viewport = Rt), S.toneMapping = mt;
      }
      function as(M, I, O) {
        const B = I.isScene === true ? I.overrideMaterial : null;
        for (let L = 0, Q = M.length; L < Q; L++) {
          const lt = M[L], pt = lt.object, mt = lt.geometry, Rt = B === null ? lt.material : B, Lt = lt.group;
          pt.layers.test(O.layers) && ao(pt, I, O, mt, Rt, Lt);
        }
      }
      function ao(M, I, O, B, L, Q) {
        M.onBeforeRender(S, I, O, B, L, Q), M.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse, M.matrixWorld), M.normalMatrix.getNormalMatrix(M.modelViewMatrix), L.onBeforeRender(S, I, O, B, M, Q), L.transparent === true && L.side === qe && L.forceSinglePass === false ? (L.side = Ie, L.needsUpdate = true, S.renderBufferDirect(O, I, B, L, M, Q), L.side = Pn, L.needsUpdate = true, S.renderBufferDirect(O, I, B, L, M, Q), L.side = qe) : S.renderBufferDirect(O, I, B, L, M, Q), M.onAfterRender(S, I, O, B, L, Q);
      }
      function os(M, I, O) {
        I.isScene !== true && (I = re);
        const B = yt.get(M), L = u.state.lights, Q = u.state.shadowsArray, lt = L.state.version, pt = xt.getParameters(M, L.state, Q, I, O), mt = xt.getProgramCacheKey(pt);
        let Rt = B.programs;
        B.environment = M.isMeshStandardMaterial ? I.environment : null, B.fog = I.fog, B.envMap = (M.isMeshStandardMaterial ? F : _).get(M.envMap || B.environment), B.envMapRotation = B.environment !== null && M.envMap === null ? I.environmentRotation : M.envMapRotation, Rt === void 0 && (M.addEventListener("dispose", It), Rt = /* @__PURE__ */ new Map(), B.programs = Rt);
        let Lt = Rt.get(mt);
        if (Lt !== void 0) {
          if (B.currentProgram === Lt && B.lightsStateVersion === lt) return lo(M, pt), Lt;
        } else pt.uniforms = xt.getUniforms(M), M.onBeforeCompile(pt, S), Lt = xt.acquireProgram(pt, mt), Rt.set(mt, Lt), B.uniforms = pt.uniforms;
        const gt = B.uniforms;
        return (!M.isShaderMaterial && !M.isRawShaderMaterial || M.clipping === true) && (gt.clippingPlanes = J.uniform), lo(M, pt), B.needsLights = Sh(M), B.lightsStateVersion = lt, B.needsLights && (gt.ambientLightColor.value = L.state.ambient, gt.lightProbe.value = L.state.probe, gt.directionalLights.value = L.state.directional, gt.directionalLightShadows.value = L.state.directionalShadow, gt.spotLights.value = L.state.spot, gt.spotLightShadows.value = L.state.spotShadow, gt.rectAreaLights.value = L.state.rectArea, gt.ltc_1.value = L.state.rectAreaLTC1, gt.ltc_2.value = L.state.rectAreaLTC2, gt.pointLights.value = L.state.point, gt.pointLightShadows.value = L.state.pointShadow, gt.hemisphereLights.value = L.state.hemi, gt.directionalShadowMap.value = L.state.directionalShadowMap, gt.directionalShadowMatrix.value = L.state.directionalShadowMatrix, gt.spotShadowMap.value = L.state.spotShadowMap, gt.spotLightMatrix.value = L.state.spotLightMatrix, gt.spotLightMap.value = L.state.spotLightMap, gt.pointShadowMap.value = L.state.pointShadowMap, gt.pointShadowMatrix.value = L.state.pointShadowMatrix), B.currentProgram = Lt, B.uniformsList = null, Lt;
      }
      function oo(M) {
        if (M.uniformsList === null) {
          const I = M.currentProgram.getUniforms();
          M.uniformsList = Xs.seqWithValue(I.seq, M.uniforms);
        }
        return M.uniformsList;
      }
      function lo(M, I) {
        const O = yt.get(M);
        O.outputColorSpace = I.outputColorSpace, O.batching = I.batching, O.batchingColor = I.batchingColor, O.instancing = I.instancing, O.instancingColor = I.instancingColor, O.instancingMorph = I.instancingMorph, O.skinning = I.skinning, O.morphTargets = I.morphTargets, O.morphNormals = I.morphNormals, O.morphColors = I.morphColors, O.morphTargetsCount = I.morphTargetsCount, O.numClippingPlanes = I.numClippingPlanes, O.numIntersection = I.numClipIntersection, O.vertexAlphas = I.vertexAlphas, O.vertexTangents = I.vertexTangents, O.toneMapping = I.toneMapping;
      }
      function xh(M, I, O, B, L) {
        I.isScene !== true && (I = re), T.resetTextureUnits();
        const Q = I.fog, lt = B.isMeshStandardMaterial ? I.environment : null, pt = P === null ? S.outputColorSpace : P.isXRRenderTarget === true ? P.texture.colorSpace : Ii, mt = (B.isMeshStandardMaterial ? F : _).get(B.envMap || lt), Rt = B.vertexColors === true && !!O.attributes.color && O.attributes.color.itemSize === 4, Lt = !!O.attributes.tangent && (!!B.normalMap || B.anisotropy > 0), gt = !!O.morphAttributes.position, Xt = !!O.morphAttributes.normal, ee = !!O.morphAttributes.color;
        let ie = Rn;
        B.toneMapped && (P === null || P.isXRRenderTarget === true) && (ie = S.toneMapping);
        const Ce = O.morphAttributes.position || O.morphAttributes.normal || O.morphAttributes.color, qt = Ce !== void 0 ? Ce.length : 0, Mt = yt.get(B), rn = u.state.lights;
        if (et === true && (vt === true || M !== x)) {
          const ze = M === x && B.id === y;
          J.setState(B, M, ze);
        }
        let Yt = false;
        B.version === Mt.__version ? (Mt.needsLights && Mt.lightsStateVersion !== rn.state.version || Mt.outputColorSpace !== pt || L.isBatchedMesh && Mt.batching === false || !L.isBatchedMesh && Mt.batching === true || L.isBatchedMesh && Mt.batchingColor === true && L.colorTexture === null || L.isBatchedMesh && Mt.batchingColor === false && L.colorTexture !== null || L.isInstancedMesh && Mt.instancing === false || !L.isInstancedMesh && Mt.instancing === true || L.isSkinnedMesh && Mt.skinning === false || !L.isSkinnedMesh && Mt.skinning === true || L.isInstancedMesh && Mt.instancingColor === true && L.instanceColor === null || L.isInstancedMesh && Mt.instancingColor === false && L.instanceColor !== null || L.isInstancedMesh && Mt.instancingMorph === true && L.morphTexture === null || L.isInstancedMesh && Mt.instancingMorph === false && L.morphTexture !== null || Mt.envMap !== mt || B.fog === true && Mt.fog !== Q || Mt.numClippingPlanes !== void 0 && (Mt.numClippingPlanes !== J.numPlanes || Mt.numIntersection !== J.numIntersection) || Mt.vertexAlphas !== Rt || Mt.vertexTangents !== Lt || Mt.morphTargets !== gt || Mt.morphNormals !== Xt || Mt.morphColors !== ee || Mt.toneMapping !== ie || Mt.morphTargetsCount !== qt) && (Yt = true) : (Yt = true, Mt.__version = B.version);
        let Ge = Mt.currentProgram;
        Yt === true && (Ge = os(B, I, L));
        let Jn = false, Le = false, Oi = false;
        const se = Ge.getUniforms(), $e = Mt.uniforms;
        if (Et.useProgram(Ge.program) && (Jn = true, Le = true, Oi = true), B.id !== y && (y = B.id, Le = true), Jn || x !== M) {
          Et.buffers.depth.getReversed() ? (rt.copy(M.projectionMatrix), Ud(rt), Nd(rt), se.setValue(U, "projectionMatrix", rt)) : se.setValue(U, "projectionMatrix", M.projectionMatrix), se.setValue(U, "viewMatrix", M.matrixWorldInverse);
          const _n = se.map.cameraPosition;
          _n !== void 0 && _n.setValue(U, Dt.setFromMatrixPosition(M.matrixWorld)), kt.logarithmicDepthBuffer && se.setValue(U, "logDepthBufFC", 2 / (Math.log(M.far + 1) / Math.LN2)), (B.isMeshPhongMaterial || B.isMeshToonMaterial || B.isMeshLambertMaterial || B.isMeshBasicMaterial || B.isMeshStandardMaterial || B.isShaderMaterial) && se.setValue(U, "isOrthographic", M.isOrthographicCamera === true), x !== M && (x = M, Le = true, Oi = true);
        }
        if (L.isSkinnedMesh) {
          se.setOptional(U, L, "bindMatrix"), se.setOptional(U, L, "bindMatrixInverse");
          const ze = L.skeleton;
          ze && (ze.boneTexture === null && ze.computeBoneTexture(), se.setValue(U, "boneTexture", ze.boneTexture, T));
        }
        L.isBatchedMesh && (se.setOptional(U, L, "batchingTexture"), se.setValue(U, "batchingTexture", L._matricesTexture, T), se.setOptional(U, L, "batchingIdTexture"), se.setValue(U, "batchingIdTexture", L._indirectTexture, T), se.setOptional(U, L, "batchingColorTexture"), L._colorsTexture !== null && se.setValue(U, "batchingColorTexture", L._colorsTexture, T));
        const Bi = O.morphAttributes;
        if ((Bi.position !== void 0 || Bi.normal !== void 0 || Bi.color !== void 0) && Ct.update(L, O, Ge), (Le || Mt.receiveShadow !== L.receiveShadow) && (Mt.receiveShadow = L.receiveShadow, se.setValue(U, "receiveShadow", L.receiveShadow)), B.isMeshGouraudMaterial && B.envMap !== null && ($e.envMap.value = mt, $e.flipEnvMap.value = mt.isCubeTexture && mt.isRenderTargetTexture === false ? -1 : 1), B.isMeshStandardMaterial && B.envMap === null && I.environment !== null && ($e.envMapIntensity.value = I.environmentIntensity), Le && (se.setValue(U, "toneMappingExposure", S.toneMappingExposure), Mt.needsLights && Mh($e, Oi), Q && B.fog === true && at.refreshFogUniforms($e, Q), at.refreshMaterialUniforms($e, B, G, tt, u.state.transmissionRenderTarget[M.id]), Xs.upload(U, oo(Mt), $e, T)), B.isShaderMaterial && B.uniformsNeedUpdate === true && (Xs.upload(U, oo(Mt), $e, T), B.uniformsNeedUpdate = false), B.isSpriteMaterial && se.setValue(U, "center", L.center), se.setValue(U, "modelViewMatrix", L.modelViewMatrix), se.setValue(U, "normalMatrix", L.normalMatrix), se.setValue(U, "modelMatrix", L.matrixWorld), B.isShaderMaterial || B.isRawShaderMaterial) {
          const ze = B.uniformsGroups;
          for (let _n = 0, vn = ze.length; _n < vn; _n++) {
            const co = ze[_n];
            D.update(co, Ge), D.bind(co, Ge);
          }
        }
        return Ge;
      }
      function Mh(M, I) {
        M.ambientLightColor.needsUpdate = I, M.lightProbe.needsUpdate = I, M.directionalLights.needsUpdate = I, M.directionalLightShadows.needsUpdate = I, M.pointLights.needsUpdate = I, M.pointLightShadows.needsUpdate = I, M.spotLights.needsUpdate = I, M.spotLightShadows.needsUpdate = I, M.rectAreaLights.needsUpdate = I, M.hemisphereLights.needsUpdate = I;
      }
      function Sh(M) {
        return M.isMeshLambertMaterial || M.isMeshToonMaterial || M.isMeshPhongMaterial || M.isMeshStandardMaterial || M.isShadowMaterial || M.isShaderMaterial && M.lights === true;
      }
      this.getActiveCubeFace = function() {
        return A;
      }, this.getActiveMipmapLevel = function() {
        return w;
      }, this.getRenderTarget = function() {
        return P;
      }, this.setRenderTargetTextures = function(M, I, O) {
        yt.get(M.texture).__webglTexture = I, yt.get(M.depthTexture).__webglTexture = O;
        const B = yt.get(M);
        B.__hasExternalTextures = true, B.__autoAllocateDepthBuffer = O === void 0, B.__autoAllocateDepthBuffer || zt.has("WEBGL_multisampled_render_to_texture") === true && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), B.__useRenderToTexture = false);
      }, this.setRenderTargetFramebuffer = function(M, I) {
        const O = yt.get(M);
        O.__webglFramebuffer = I, O.__useDefaultFramebuffer = I === void 0;
      }, this.setRenderTarget = function(M, I = 0, O = 0) {
        P = M, A = I, w = O;
        let B = true, L = null, Q = false, lt = false;
        if (M) {
          const mt = yt.get(M);
          if (mt.__useDefaultFramebuffer !== void 0) Et.bindFramebuffer(U.FRAMEBUFFER, null), B = false;
          else if (mt.__webglFramebuffer === void 0) T.setupRenderTarget(M);
          else if (mt.__hasExternalTextures) T.rebindTextures(M, yt.get(M.texture).__webglTexture, yt.get(M.depthTexture).__webglTexture);
          else if (M.depthBuffer) {
            const gt = M.depthTexture;
            if (mt.__boundDepthTexture !== gt) {
              if (gt !== null && yt.has(gt) && (M.width !== gt.image.width || M.height !== gt.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
              T.setupDepthRenderbuffer(M);
            }
          }
          const Rt = M.texture;
          (Rt.isData3DTexture || Rt.isDataArrayTexture || Rt.isCompressedArrayTexture) && (lt = true);
          const Lt = yt.get(M).__webglFramebuffer;
          M.isWebGLCubeRenderTarget ? (Array.isArray(Lt[I]) ? L = Lt[I][O] : L = Lt[I], Q = true) : M.samples > 0 && T.useMultisampledRTT(M) === false ? L = yt.get(M).__webglMultisampledFramebuffer : Array.isArray(Lt) ? L = Lt[O] : L = Lt, C.copy(M.viewport), k.copy(M.scissor), z = M.scissorTest;
        } else C.copy(St).multiplyScalar(G).floor(), k.copy(Ot).multiplyScalar(G).floor(), z = Qt;
        if (Et.bindFramebuffer(U.FRAMEBUFFER, L) && B && Et.drawBuffers(M, L), Et.viewport(C), Et.scissor(k), Et.setScissorTest(z), Q) {
          const mt = yt.get(M.texture);
          U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + I, mt.__webglTexture, O);
        } else if (lt) {
          const mt = yt.get(M.texture), Rt = I || 0;
          U.framebufferTextureLayer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, mt.__webglTexture, O || 0, Rt);
        }
        y = -1;
      }, this.readRenderTargetPixels = function(M, I, O, B, L, Q, lt) {
        if (!(M && M.isWebGLRenderTarget)) {
          console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
          return;
        }
        let pt = yt.get(M).__webglFramebuffer;
        if (M.isWebGLCubeRenderTarget && lt !== void 0 && (pt = pt[lt]), pt) {
          Et.bindFramebuffer(U.FRAMEBUFFER, pt);
          try {
            const mt = M.texture, Rt = mt.format, Lt = mt.type;
            if (!kt.textureFormatReadable(Rt)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
              return;
            }
            if (!kt.textureTypeReadable(Lt)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
              return;
            }
            I >= 0 && I <= M.width - B && O >= 0 && O <= M.height - L && U.readPixels(I, O, B, L, Nt.convert(Rt), Nt.convert(Lt), Q);
          } finally {
            const mt = P !== null ? yt.get(P).__webglFramebuffer : null;
            Et.bindFramebuffer(U.FRAMEBUFFER, mt);
          }
        }
      }, this.readRenderTargetPixelsAsync = async function(M, I, O, B, L, Q, lt) {
        if (!(M && M.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        let pt = yt.get(M).__webglFramebuffer;
        if (M.isWebGLCubeRenderTarget && lt !== void 0 && (pt = pt[lt]), pt) {
          const mt = M.texture, Rt = mt.format, Lt = mt.type;
          if (!kt.textureFormatReadable(Rt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!kt.textureTypeReadable(Lt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          if (I >= 0 && I <= M.width - B && O >= 0 && O <= M.height - L) {
            Et.bindFramebuffer(U.FRAMEBUFFER, pt);
            const gt = U.createBuffer();
            U.bindBuffer(U.PIXEL_PACK_BUFFER, gt), U.bufferData(U.PIXEL_PACK_BUFFER, Q.byteLength, U.STREAM_READ), U.readPixels(I, O, B, L, Nt.convert(Rt), Nt.convert(Lt), 0);
            const Xt = P !== null ? yt.get(P).__webglFramebuffer : null;
            Et.bindFramebuffer(U.FRAMEBUFFER, Xt);
            const ee = U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE, 0);
            return U.flush(), await Ld(U, ee, 4), U.bindBuffer(U.PIXEL_PACK_BUFFER, gt), U.getBufferSubData(U.PIXEL_PACK_BUFFER, 0, Q), U.deleteBuffer(gt), U.deleteSync(ee), Q;
          } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
        }
      }, this.copyFramebufferToTexture = function(M, I = null, O = 0) {
        M.isTexture !== true && (Zi("WebGLRenderer: copyFramebufferToTexture function signature has changed."), I = arguments[0] || null, M = arguments[1]);
        const B = Math.pow(2, -O), L = Math.floor(M.image.width * B), Q = Math.floor(M.image.height * B), lt = I !== null ? I.x : 0, pt = I !== null ? I.y : 0;
        T.setTexture2D(M, 0), U.copyTexSubImage2D(U.TEXTURE_2D, O, 0, 0, lt, pt, L, Q), Et.unbindTexture();
      }, this.copyTextureToTexture = function(M, I, O = null, B = null, L = 0) {
        M.isTexture !== true && (Zi("WebGLRenderer: copyTextureToTexture function signature has changed."), B = arguments[0] || null, M = arguments[1], I = arguments[2], L = arguments[3] || 0, O = null);
        let Q, lt, pt, mt, Rt, Lt, gt, Xt, ee;
        const ie = M.isCompressedTexture ? M.mipmaps[L] : M.image;
        O !== null ? (Q = O.max.x - O.min.x, lt = O.max.y - O.min.y, pt = O.isBox3 ? O.max.z - O.min.z : 1, mt = O.min.x, Rt = O.min.y, Lt = O.isBox3 ? O.min.z : 0) : (Q = ie.width, lt = ie.height, pt = ie.depth || 1, mt = 0, Rt = 0, Lt = 0), B !== null ? (gt = B.x, Xt = B.y, ee = B.z) : (gt = 0, Xt = 0, ee = 0);
        const Ce = Nt.convert(I.format), qt = Nt.convert(I.type);
        let Mt;
        I.isData3DTexture ? (T.setTexture3D(I, 0), Mt = U.TEXTURE_3D) : I.isDataArrayTexture || I.isCompressedArrayTexture ? (T.setTexture2DArray(I, 0), Mt = U.TEXTURE_2D_ARRAY) : (T.setTexture2D(I, 0), Mt = U.TEXTURE_2D), U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, I.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, I.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, I.unpackAlignment);
        const rn = U.getParameter(U.UNPACK_ROW_LENGTH), Yt = U.getParameter(U.UNPACK_IMAGE_HEIGHT), Ge = U.getParameter(U.UNPACK_SKIP_PIXELS), Jn = U.getParameter(U.UNPACK_SKIP_ROWS), Le = U.getParameter(U.UNPACK_SKIP_IMAGES);
        U.pixelStorei(U.UNPACK_ROW_LENGTH, ie.width), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, ie.height), U.pixelStorei(U.UNPACK_SKIP_PIXELS, mt), U.pixelStorei(U.UNPACK_SKIP_ROWS, Rt), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Lt);
        const Oi = M.isDataArrayTexture || M.isData3DTexture, se = I.isDataArrayTexture || I.isData3DTexture;
        if (M.isRenderTargetTexture || M.isDepthTexture) {
          const $e = yt.get(M), Bi = yt.get(I), ze = yt.get($e.__renderTarget), _n = yt.get(Bi.__renderTarget);
          Et.bindFramebuffer(U.READ_FRAMEBUFFER, ze.__webglFramebuffer), Et.bindFramebuffer(U.DRAW_FRAMEBUFFER, _n.__webglFramebuffer);
          for (let vn = 0; vn < pt; vn++) Oi && U.framebufferTextureLayer(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, yt.get(M).__webglTexture, L, Lt + vn), M.isDepthTexture ? (se && U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, yt.get(I).__webglTexture, L, ee + vn), U.blitFramebuffer(mt, Rt, Q, lt, gt, Xt, Q, lt, U.DEPTH_BUFFER_BIT, U.NEAREST)) : se ? U.copyTexSubImage3D(Mt, L, gt, Xt, ee + vn, mt, Rt, Q, lt) : U.copyTexSubImage2D(Mt, L, gt, Xt, ee + vn, mt, Rt, Q, lt);
          Et.bindFramebuffer(U.READ_FRAMEBUFFER, null), Et.bindFramebuffer(U.DRAW_FRAMEBUFFER, null);
        } else se ? M.isDataTexture || M.isData3DTexture ? U.texSubImage3D(Mt, L, gt, Xt, ee, Q, lt, pt, Ce, qt, ie.data) : I.isCompressedArrayTexture ? U.compressedTexSubImage3D(Mt, L, gt, Xt, ee, Q, lt, pt, Ce, ie.data) : U.texSubImage3D(Mt, L, gt, Xt, ee, Q, lt, pt, Ce, qt, ie) : M.isDataTexture ? U.texSubImage2D(U.TEXTURE_2D, L, gt, Xt, Q, lt, Ce, qt, ie.data) : M.isCompressedTexture ? U.compressedTexSubImage2D(U.TEXTURE_2D, L, gt, Xt, ie.width, ie.height, Ce, ie.data) : U.texSubImage2D(U.TEXTURE_2D, L, gt, Xt, Q, lt, Ce, qt, ie);
        U.pixelStorei(U.UNPACK_ROW_LENGTH, rn), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, Yt), U.pixelStorei(U.UNPACK_SKIP_PIXELS, Ge), U.pixelStorei(U.UNPACK_SKIP_ROWS, Jn), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Le), L === 0 && I.generateMipmaps && U.generateMipmap(Mt), Et.unbindTexture();
      }, this.copyTextureToTexture3D = function(M, I, O = null, B = null, L = 0) {
        return M.isTexture !== true && (Zi("WebGLRenderer: copyTextureToTexture3D function signature has changed."), O = arguments[0] || null, B = arguments[1] || null, M = arguments[2], I = arguments[3], L = arguments[4] || 0), Zi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'), this.copyTextureToTexture(M, I, O, B, L);
      }, this.initRenderTarget = function(M) {
        yt.get(M).__webglFramebuffer === void 0 && T.setupRenderTarget(M);
      }, this.initTexture = function(M) {
        M.isCubeTexture ? T.setTextureCube(M, 0) : M.isData3DTexture ? T.setTexture3D(M, 0) : M.isDataArrayTexture || M.isCompressedArrayTexture ? T.setTexture2DArray(M, 0) : T.setTexture2D(M, 0), Et.unbindTexture();
      }, this.resetState = function() {
        A = 0, w = 0, P = null, Et.reset(), te.reset();
      }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
        detail: this
      }));
    }
    get coordinateSystem() {
      return dn;
    }
    get outputColorSpace() {
      return this._outputColorSpace;
    }
    set outputColorSpace(t) {
      this._outputColorSpace = t;
      const e = this.getContext();
      e.drawingBufferColorspace = Gt._getDrawingBufferColorSpace(t), e.unpackColorSpace = Gt._getUnpackColorSpace();
    }
  }
  class X_ extends ve {
    constructor() {
      super(), this.isScene = true, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new nn(), this.environmentIntensity = 1, this.environmentRotation = new nn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
        detail: this
      }));
    }
    copy(t, e) {
      return super.copy(t, e), t.background !== null && (this.background = t.background.clone()), t.environment !== null && (this.environment = t.environment.clone()), t.fog !== null && (this.fog = t.fog.clone()), this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, this.backgroundRotation.copy(t.backgroundRotation), this.environmentIntensity = t.environmentIntensity, this.environmentRotation.copy(t.environmentRotation), t.overrideMaterial !== null && (this.overrideMaterial = t.overrideMaterial.clone()), this.matrixAutoUpdate = t.matrixAutoUpdate, this;
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return this.fog !== null && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (e.object.backgroundIntensity = this.backgroundIntensity), e.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (e.object.environmentIntensity = this.environmentIntensity), e.object.environmentRotation = this.environmentRotation.toArray(), e;
    }
  }
  class q_ extends we {
    constructor(t = null, e = 1, n = 1, s, r, a, o, l, c = Oe, h = Oe, d, f) {
      super(null, a, o, l, c, h, s, r, d, f), this.isDataTexture = true, this.image = {
        data: t,
        width: e,
        height: n
      }, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
    }
  }
  class Dl extends xe {
    constructor(t, e, n, s = 1) {
      super(t, e, n), this.isInstancedBufferAttribute = true, this.meshPerAttribute = s;
    }
    copy(t) {
      return super.copy(t), this.meshPerAttribute = t.meshPerAttribute, this;
    }
    toJSON() {
      const t = super.toJSON();
      return t.meshPerAttribute = this.meshPerAttribute, t.isInstancedBufferAttribute = true, t;
    }
  }
  const fi = new Zt(), Il = new Zt(), Is = [], Ll = new Kn(), Y_ = new Zt(), Xi = new _e(), qi = new Zn();
  class Yi extends _e {
    constructor(t, e, n) {
      super(t, e), this.isInstancedMesh = true, this.instanceMatrix = new Dl(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
      for (let s = 0; s < n; s++) this.setMatrixAt(s, Y_);
    }
    computeBoundingBox() {
      const t = this.geometry, e = this.count;
      this.boundingBox === null && (this.boundingBox = new Kn()), t.boundingBox === null && t.computeBoundingBox(), this.boundingBox.makeEmpty();
      for (let n = 0; n < e; n++) this.getMatrixAt(n, fi), Ll.copy(t.boundingBox).applyMatrix4(fi), this.boundingBox.union(Ll);
    }
    computeBoundingSphere() {
      const t = this.geometry, e = this.count;
      this.boundingSphere === null && (this.boundingSphere = new Zn()), t.boundingSphere === null && t.computeBoundingSphere(), this.boundingSphere.makeEmpty();
      for (let n = 0; n < e; n++) this.getMatrixAt(n, fi), qi.copy(t.boundingSphere).applyMatrix4(fi), this.boundingSphere.union(qi);
    }
    copy(t, e) {
      return super.copy(t, e), this.instanceMatrix.copy(t.instanceMatrix), t.morphTexture !== null && (this.morphTexture = t.morphTexture.clone()), t.instanceColor !== null && (this.instanceColor = t.instanceColor.clone()), this.count = t.count, t.boundingBox !== null && (this.boundingBox = t.boundingBox.clone()), t.boundingSphere !== null && (this.boundingSphere = t.boundingSphere.clone()), this;
    }
    getColorAt(t, e) {
      e.fromArray(this.instanceColor.array, t * 3);
    }
    getMatrixAt(t, e) {
      e.fromArray(this.instanceMatrix.array, t * 16);
    }
    getMorphAt(t, e) {
      const n = e.morphTargetInfluences, s = this.morphTexture.source.data.data, r = n.length + 1, a = t * r + 1;
      for (let o = 0; o < n.length; o++) n[o] = s[a + o];
    }
    raycast(t, e) {
      const n = this.matrixWorld, s = this.count;
      if (Xi.geometry = this.geometry, Xi.material = this.material, Xi.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), qi.copy(this.boundingSphere), qi.applyMatrix4(n), t.ray.intersectsSphere(qi) !== false)) for (let r = 0; r < s; r++) {
        this.getMatrixAt(r, fi), Il.multiplyMatrices(n, fi), Xi.matrixWorld = Il, Xi.raycast(t, Is);
        for (let a = 0, o = Is.length; a < o; a++) {
          const l = Is[a];
          l.instanceId = r, l.object = this, e.push(l);
        }
        Is.length = 0;
      }
    }
    setColorAt(t, e) {
      this.instanceColor === null && (this.instanceColor = new Dl(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), e.toArray(this.instanceColor.array, t * 3);
    }
    setMatrixAt(t, e) {
      e.toArray(this.instanceMatrix.array, t * 16);
    }
    setMorphAt(t, e) {
      const n = e.morphTargetInfluences, s = n.length + 1;
      this.morphTexture === null && (this.morphTexture = new q_(new Float32Array(s * this.count), s, this.count, Ga, tn));
      const r = this.morphTexture.source.data.data;
      let a = 0;
      for (let c = 0; c < n.length; c++) a += n[c];
      const o = this.geometry.morphTargetsRelative ? 1 : 1 - a, l = s * t;
      r[l] = o, r.set(n, l + 1);
    }
    updateMorphTargets() {
    }
    dispose() {
      return this.dispatchEvent({
        type: "dispose"
      }), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null), this;
    }
  }
  class nh extends $n {
    static get type() {
      return "LineBasicMaterial";
    }
    constructor(t) {
      super(), this.isLineBasicMaterial = true, this.color = new Pt(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
    }
  }
  const js = new R(), Ks = new R(), Ul = new Zt(), ji = new is(), Ls = new Zn(), Ur = new R(), Nl = new R();
  class j_ extends ve {
    constructor(t = new be(), e = new nh()) {
      super(), this.isLine = true, this.type = "Line", this.geometry = t, this.material = e, this.updateMorphTargets();
    }
    copy(t, e) {
      return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
    }
    computeLineDistances() {
      const t = this.geometry;
      if (t.index === null) {
        const e = t.attributes.position, n = [
          0
        ];
        for (let s = 1, r = e.count; s < r; s++) js.fromBufferAttribute(e, s - 1), Ks.fromBufferAttribute(e, s), n[s] = n[s - 1], n[s] += js.distanceTo(Ks);
        t.setAttribute("lineDistance", new fe(n, 1));
      } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
      return this;
    }
    raycast(t, e) {
      const n = this.geometry, s = this.matrixWorld, r = t.params.Line.threshold, a = n.drawRange;
      if (n.boundingSphere === null && n.computeBoundingSphere(), Ls.copy(n.boundingSphere), Ls.applyMatrix4(s), Ls.radius += r, t.ray.intersectsSphere(Ls) === false) return;
      Ul.copy(s).invert(), ji.copy(t.ray).applyMatrix4(Ul);
      const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, c = this.isLineSegments ? 2 : 1, h = n.index, f = n.attributes.position;
      if (h !== null) {
        const p = Math.max(0, a.start), g = Math.min(h.count, a.start + a.count);
        for (let v = p, m = g - 1; v < m; v += c) {
          const u = h.getX(v), b = h.getX(v + 1), E = Us(this, t, ji, l, u, b);
          E && e.push(E);
        }
        if (this.isLineLoop) {
          const v = h.getX(g - 1), m = h.getX(p), u = Us(this, t, ji, l, v, m);
          u && e.push(u);
        }
      } else {
        const p = Math.max(0, a.start), g = Math.min(f.count, a.start + a.count);
        for (let v = p, m = g - 1; v < m; v += c) {
          const u = Us(this, t, ji, l, v, v + 1);
          u && e.push(u);
        }
        if (this.isLineLoop) {
          const v = Us(this, t, ji, l, g - 1, p);
          v && e.push(v);
        }
      }
    }
    updateMorphTargets() {
      const e = this.geometry.morphAttributes, n = Object.keys(e);
      if (n.length > 0) {
        const s = e[n[0]];
        if (s !== void 0) {
          this.morphTargetInfluences = [], this.morphTargetDictionary = {};
          for (let r = 0, a = s.length; r < a; r++) {
            const o = s[r].name || String(r);
            this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r;
          }
        }
      }
    }
  }
  function Us(i, t, e, n, s, r) {
    const a = i.geometry.attributes.position;
    if (js.fromBufferAttribute(a, s), Ks.fromBufferAttribute(a, r), e.distanceSqToSegment(js, Ks, Ur, Nl) > n) return;
    Ur.applyMatrix4(i.matrixWorld);
    const l = t.ray.origin.distanceTo(Ur);
    if (!(l < t.near || l > t.far)) return {
      distance: l,
      point: Nl.clone().applyMatrix4(i.matrixWorld),
      index: s,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i
    };
  }
  class ih extends $n {
    static get type() {
      return "PointsMaterial";
    }
    constructor(t) {
      super(), this.isPointsMaterial = true, this.color = new Pt(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = true, this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
    }
  }
  const Fl = new Zt(), Pa = new is(), Ns = new Zn(), Fs = new R();
  class sh extends ve {
    constructor(t = new be(), e = new ih()) {
      super(), this.isPoints = true, this.type = "Points", this.geometry = t, this.material = e, this.updateMorphTargets();
    }
    copy(t, e) {
      return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
    }
    raycast(t, e) {
      const n = this.geometry, s = this.matrixWorld, r = t.params.Points.threshold, a = n.drawRange;
      if (n.boundingSphere === null && n.computeBoundingSphere(), Ns.copy(n.boundingSphere), Ns.applyMatrix4(s), Ns.radius += r, t.ray.intersectsSphere(Ns) === false) return;
      Fl.copy(s).invert(), Pa.copy(t.ray).applyMatrix4(Fl);
      const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, c = n.index, d = n.attributes.position;
      if (c !== null) {
        const f = Math.max(0, a.start), p = Math.min(c.count, a.start + a.count);
        for (let g = f, v = p; g < v; g++) {
          const m = c.getX(g);
          Fs.fromBufferAttribute(d, m), Ol(Fs, m, l, s, t, e, this);
        }
      } else {
        const f = Math.max(0, a.start), p = Math.min(d.count, a.start + a.count);
        for (let g = f, v = p; g < v; g++) Fs.fromBufferAttribute(d, g), Ol(Fs, g, l, s, t, e, this);
      }
    }
    updateMorphTargets() {
      const e = this.geometry.morphAttributes, n = Object.keys(e);
      if (n.length > 0) {
        const s = e[n[0]];
        if (s !== void 0) {
          this.morphTargetInfluences = [], this.morphTargetDictionary = {};
          for (let r = 0, a = s.length; r < a; r++) {
            const o = s[r].name || String(r);
            this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r;
          }
        }
      }
    }
  }
  function Ol(i, t, e, n, s, r, a) {
    const o = Pa.distanceSqToPoint(i);
    if (o < e) {
      const l = new R();
      Pa.closestPointToPoint(i, l), l.applyMatrix4(n);
      const c = s.ray.origin.distanceTo(l);
      if (c < s.near || c > s.far) return;
      r.push({
        distance: c,
        distanceToRay: Math.sqrt(o),
        point: l,
        index: t,
        face: null,
        faceIndex: null,
        barycoord: null,
        object: a
      });
    }
  }
  class Za extends be {
    constructor(t = 1, e = 1, n = 1, s = 32, r = 1, a = false, o = 0, l = Math.PI * 2) {
      super(), this.type = "CylinderGeometry", this.parameters = {
        radiusTop: t,
        radiusBottom: e,
        height: n,
        radialSegments: s,
        heightSegments: r,
        openEnded: a,
        thetaStart: o,
        thetaLength: l
      };
      const c = this;
      s = Math.floor(s), r = Math.floor(r);
      const h = [], d = [], f = [], p = [];
      let g = 0;
      const v = [], m = n / 2;
      let u = 0;
      b(), a === false && (t > 0 && E(true), e > 0 && E(false)), this.setIndex(h), this.setAttribute("position", new fe(d, 3)), this.setAttribute("normal", new fe(f, 3)), this.setAttribute("uv", new fe(p, 2));
      function b() {
        const S = new R(), N = new R();
        let A = 0;
        const w = (e - t) / n;
        for (let P = 0; P <= r; P++) {
          const y = [], x = P / r, C = x * (e - t) + t;
          for (let k = 0; k <= s; k++) {
            const z = k / s, V = z * l + o, Z = Math.sin(V), W = Math.cos(V);
            N.x = C * Z, N.y = -x * n + m, N.z = C * W, d.push(N.x, N.y, N.z), S.set(Z, w, W).normalize(), f.push(S.x, S.y, S.z), p.push(z, 1 - x), y.push(g++);
          }
          v.push(y);
        }
        for (let P = 0; P < s; P++) for (let y = 0; y < r; y++) {
          const x = v[y][P], C = v[y + 1][P], k = v[y + 1][P + 1], z = v[y][P + 1];
          (t > 0 || y !== 0) && (h.push(x, C, z), A += 3), (e > 0 || y !== r - 1) && (h.push(C, k, z), A += 3);
        }
        c.addGroup(u, A, 0), u += A;
      }
      function E(S) {
        const N = g, A = new _t(), w = new R();
        let P = 0;
        const y = S === true ? t : e, x = S === true ? 1 : -1;
        for (let k = 1; k <= s; k++) d.push(0, m * x, 0), f.push(0, x, 0), p.push(0.5, 0.5), g++;
        const C = g;
        for (let k = 0; k <= s; k++) {
          const V = k / s * l + o, Z = Math.cos(V), W = Math.sin(V);
          w.x = y * W, w.y = m * x, w.z = y * Z, d.push(w.x, w.y, w.z), f.push(0, x, 0), A.x = Z * 0.5 + 0.5, A.y = W * 0.5 * x + 0.5, p.push(A.x, A.y), g++;
        }
        for (let k = 0; k < s; k++) {
          const z = N + k, V = C + k;
          S === true ? h.push(V, V + 1, z) : h.push(V + 1, V, z), P += 3;
        }
        c.addGroup(u, P, S === true ? 1 : 2), u += P;
      }
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new Za(t.radiusTop, t.radiusBottom, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
    }
  }
  class $a extends Za {
    constructor(t = 1, e = 1, n = 32, s = 1, r = false, a = 0, o = Math.PI * 2) {
      super(0, t, e, n, s, r, a, o), this.type = "ConeGeometry", this.parameters = {
        radius: t,
        height: e,
        radialSegments: n,
        heightSegments: s,
        openEnded: r,
        thetaStart: a,
        thetaLength: o
      };
    }
    static fromJSON(t) {
      return new $a(t.radius, t.height, t.radialSegments, t.heightSegments, t.openEnded, t.thetaStart, t.thetaLength);
    }
  }
  class Ja extends be {
    constructor(t = [], e = [], n = 1, s = 0) {
      super(), this.type = "PolyhedronGeometry", this.parameters = {
        vertices: t,
        indices: e,
        radius: n,
        detail: s
      };
      const r = [], a = [];
      o(s), c(n), h(), this.setAttribute("position", new fe(r, 3)), this.setAttribute("normal", new fe(r.slice(), 3)), this.setAttribute("uv", new fe(a, 2)), s === 0 ? this.computeVertexNormals() : this.normalizeNormals();
      function o(b) {
        const E = new R(), S = new R(), N = new R();
        for (let A = 0; A < e.length; A += 3) p(e[A + 0], E), p(e[A + 1], S), p(e[A + 2], N), l(E, S, N, b);
      }
      function l(b, E, S, N) {
        const A = N + 1, w = [];
        for (let P = 0; P <= A; P++) {
          w[P] = [];
          const y = b.clone().lerp(S, P / A), x = E.clone().lerp(S, P / A), C = A - P;
          for (let k = 0; k <= C; k++) k === 0 && P === A ? w[P][k] = y : w[P][k] = y.clone().lerp(x, k / C);
        }
        for (let P = 0; P < A; P++) for (let y = 0; y < 2 * (A - P) - 1; y++) {
          const x = Math.floor(y / 2);
          y % 2 === 0 ? (f(w[P][x + 1]), f(w[P + 1][x]), f(w[P][x])) : (f(w[P][x + 1]), f(w[P + 1][x + 1]), f(w[P + 1][x]));
        }
      }
      function c(b) {
        const E = new R();
        for (let S = 0; S < r.length; S += 3) E.x = r[S + 0], E.y = r[S + 1], E.z = r[S + 2], E.normalize().multiplyScalar(b), r[S + 0] = E.x, r[S + 1] = E.y, r[S + 2] = E.z;
      }
      function h() {
        const b = new R();
        for (let E = 0; E < r.length; E += 3) {
          b.x = r[E + 0], b.y = r[E + 1], b.z = r[E + 2];
          const S = m(b) / 2 / Math.PI + 0.5, N = u(b) / Math.PI + 0.5;
          a.push(S, 1 - N);
        }
        g(), d();
      }
      function d() {
        for (let b = 0; b < a.length; b += 6) {
          const E = a[b + 0], S = a[b + 2], N = a[b + 4], A = Math.max(E, S, N), w = Math.min(E, S, N);
          A > 0.9 && w < 0.1 && (E < 0.2 && (a[b + 0] += 1), S < 0.2 && (a[b + 2] += 1), N < 0.2 && (a[b + 4] += 1));
        }
      }
      function f(b) {
        r.push(b.x, b.y, b.z);
      }
      function p(b, E) {
        const S = b * 3;
        E.x = t[S + 0], E.y = t[S + 1], E.z = t[S + 2];
      }
      function g() {
        const b = new R(), E = new R(), S = new R(), N = new R(), A = new _t(), w = new _t(), P = new _t();
        for (let y = 0, x = 0; y < r.length; y += 9, x += 6) {
          b.set(r[y + 0], r[y + 1], r[y + 2]), E.set(r[y + 3], r[y + 4], r[y + 5]), S.set(r[y + 6], r[y + 7], r[y + 8]), A.set(a[x + 0], a[x + 1]), w.set(a[x + 2], a[x + 3]), P.set(a[x + 4], a[x + 5]), N.copy(b).add(E).add(S).divideScalar(3);
          const C = m(N);
          v(A, x + 0, b, C), v(w, x + 2, E, C), v(P, x + 4, S, C);
        }
      }
      function v(b, E, S, N) {
        N < 0 && b.x === 1 && (a[E] = b.x - 1), S.x === 0 && S.z === 0 && (a[E] = N / 2 / Math.PI + 0.5);
      }
      function m(b) {
        return Math.atan2(b.z, -b.x);
      }
      function u(b) {
        return Math.atan2(-b.y, Math.sqrt(b.x * b.x + b.z * b.z));
      }
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new Ja(t.vertices, t.indices, t.radius, t.details);
    }
  }
  class Qa extends Ja {
    constructor(t = 1, e = 0) {
      const n = (1 + Math.sqrt(5)) / 2, s = [
        -1,
        n,
        0,
        1,
        n,
        0,
        -1,
        -n,
        0,
        1,
        -n,
        0,
        0,
        -1,
        n,
        0,
        1,
        n,
        0,
        -1,
        -n,
        0,
        1,
        -n,
        n,
        0,
        -1,
        n,
        0,
        1,
        -n,
        0,
        -1,
        -n,
        0,
        1
      ], r = [
        0,
        11,
        5,
        0,
        5,
        1,
        0,
        1,
        7,
        0,
        7,
        10,
        0,
        10,
        11,
        1,
        5,
        9,
        5,
        11,
        4,
        11,
        10,
        2,
        10,
        7,
        6,
        7,
        1,
        8,
        3,
        9,
        4,
        3,
        4,
        2,
        3,
        2,
        6,
        3,
        6,
        8,
        3,
        8,
        9,
        4,
        9,
        5,
        2,
        4,
        11,
        6,
        2,
        10,
        8,
        6,
        7,
        9,
        8,
        1
      ];
      super(s, r, t, e), this.type = "IcosahedronGeometry", this.parameters = {
        radius: t,
        detail: e
      };
    }
    static fromJSON(t) {
      return new Qa(t.radius, t.detail);
    }
  }
  class bi extends be {
    constructor(t = 1, e = 32, n = 16, s = 0, r = Math.PI * 2, a = 0, o = Math.PI) {
      super(), this.type = "SphereGeometry", this.parameters = {
        radius: t,
        widthSegments: e,
        heightSegments: n,
        phiStart: s,
        phiLength: r,
        thetaStart: a,
        thetaLength: o
      }, e = Math.max(3, Math.floor(e)), n = Math.max(2, Math.floor(n));
      const l = Math.min(a + o, Math.PI);
      let c = 0;
      const h = [], d = new R(), f = new R(), p = [], g = [], v = [], m = [];
      for (let u = 0; u <= n; u++) {
        const b = [], E = u / n;
        let S = 0;
        u === 0 && a === 0 ? S = 0.5 / e : u === n && l === Math.PI && (S = -0.5 / e);
        for (let N = 0; N <= e; N++) {
          const A = N / e;
          d.x = -t * Math.cos(s + A * r) * Math.sin(a + E * o), d.y = t * Math.cos(a + E * o), d.z = t * Math.sin(s + A * r) * Math.sin(a + E * o), g.push(d.x, d.y, d.z), f.copy(d).normalize(), v.push(f.x, f.y, f.z), m.push(A + S, 1 - E), b.push(c++);
        }
        h.push(b);
      }
      for (let u = 0; u < n; u++) for (let b = 0; b < e; b++) {
        const E = h[u][b + 1], S = h[u][b], N = h[u + 1][b], A = h[u + 1][b + 1];
        (u !== 0 || a > 0) && p.push(E, S, A), (u !== n - 1 || l < Math.PI) && p.push(S, N, A);
      }
      this.setIndex(p), this.setAttribute("position", new fe(g, 3)), this.setAttribute("normal", new fe(v, 3)), this.setAttribute("uv", new fe(m, 2));
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new bi(t.radius, t.widthSegments, t.heightSegments, t.phiStart, t.phiLength, t.thetaStart, t.thetaLength);
    }
  }
  class K_ extends de {
    static get type() {
      return "RawShaderMaterial";
    }
    constructor(t) {
      super(t), this.isRawShaderMaterial = true;
    }
  }
  class Nr extends $n {
    static get type() {
      return "MeshStandardMaterial";
    }
    constructor(t) {
      super(), this.isMeshStandardMaterial = true, this.defines = {
        STANDARD: ""
      }, this.color = new Pt(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Pt(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = Oc, this.normalScale = new _t(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new nn(), this.envMapIntensity = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = false, this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.defines = {
        STANDARD: ""
      }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this;
    }
  }
  class rh extends ve {
    constructor(t, e = 1) {
      super(), this.isLight = true, this.type = "Light", this.color = new Pt(t), this.intensity = e;
    }
    dispose() {
    }
    copy(t, e) {
      return super.copy(t, e), this.color.copy(t.color), this.intensity = t.intensity, this;
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return e.object.color = this.color.getHex(), e.object.intensity = this.intensity, this.groundColor !== void 0 && (e.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (e.object.distance = this.distance), this.angle !== void 0 && (e.object.angle = this.angle), this.decay !== void 0 && (e.object.decay = this.decay), this.penumbra !== void 0 && (e.object.penumbra = this.penumbra), this.shadow !== void 0 && (e.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (e.object.target = this.target.uuid), e;
    }
  }
  const Fr = new Zt(), Bl = new R(), zl = new R();
  class Z_ {
    constructor(t) {
      this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new _t(512, 512), this.map = null, this.mapPass = null, this.matrix = new Zt(), this.autoUpdate = true, this.needsUpdate = false, this._frustum = new ja(), this._frameExtents = new _t(1, 1), this._viewportCount = 1, this._viewports = [
        new Jt(0, 0, 1, 1)
      ];
    }
    getViewportCount() {
      return this._viewportCount;
    }
    getFrustum() {
      return this._frustum;
    }
    updateMatrices(t) {
      const e = this.camera, n = this.matrix;
      Bl.setFromMatrixPosition(t.matrixWorld), e.position.copy(Bl), zl.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(zl), e.updateMatrixWorld(), Fr.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Fr), n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), n.multiply(Fr);
    }
    getViewport(t) {
      return this._viewports[t];
    }
    getFrameExtents() {
      return this._frameExtents;
    }
    dispose() {
      this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
    }
    copy(t) {
      return this.camera = t.camera.clone(), this.intensity = t.intensity, this.bias = t.bias, this.radius = t.radius, this.mapSize.copy(t.mapSize), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
    toJSON() {
      const t = {};
      return this.intensity !== 1 && (t.intensity = this.intensity), this.bias !== 0 && (t.bias = this.bias), this.normalBias !== 0 && (t.normalBias = this.normalBias), this.radius !== 1 && (t.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (t.mapSize = this.mapSize.toArray()), t.camera = this.camera.toJSON(false).object, delete t.camera.matrix, t;
    }
  }
  const kl = new Zt(), Ki = new R(), Or = new R();
  class $_ extends Z_ {
    constructor() {
      super(new De(90, 1, 0.5, 500)), this.isPointLightShadow = true, this._frameExtents = new _t(4, 2), this._viewportCount = 6, this._viewports = [
        new Jt(2, 1, 1, 1),
        new Jt(0, 1, 1, 1),
        new Jt(3, 1, 1, 1),
        new Jt(1, 1, 1, 1),
        new Jt(3, 0, 1, 1),
        new Jt(1, 0, 1, 1)
      ], this._cubeDirections = [
        new R(1, 0, 0),
        new R(-1, 0, 0),
        new R(0, 0, 1),
        new R(0, 0, -1),
        new R(0, 1, 0),
        new R(0, -1, 0)
      ], this._cubeUps = [
        new R(0, 1, 0),
        new R(0, 1, 0),
        new R(0, 1, 0),
        new R(0, 1, 0),
        new R(0, 0, 1),
        new R(0, 0, -1)
      ];
    }
    updateMatrices(t, e = 0) {
      const n = this.camera, s = this.matrix, r = t.distance || n.far;
      r !== n.far && (n.far = r, n.updateProjectionMatrix()), Ki.setFromMatrixPosition(t.matrixWorld), n.position.copy(Ki), Or.copy(n.position), Or.add(this._cubeDirections[e]), n.up.copy(this._cubeUps[e]), n.lookAt(Or), n.updateMatrixWorld(), s.makeTranslation(-Ki.x, -Ki.y, -Ki.z), kl.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(kl);
    }
  }
  class J_ extends rh {
    constructor(t, e, n = 0, s = 2) {
      super(t, e), this.isPointLight = true, this.type = "PointLight", this.distance = n, this.decay = s, this.shadow = new $_();
    }
    get power() {
      return this.intensity * 4 * Math.PI;
    }
    set power(t) {
      this.intensity = t / (4 * Math.PI);
    }
    dispose() {
      this.shadow.dispose();
    }
    copy(t, e) {
      return super.copy(t, e), this.distance = t.distance, this.decay = t.decay, this.shadow = t.shadow.clone(), this;
    }
  }
  class Q_ extends rh {
    constructor(t, e) {
      super(t, e), this.isAmbientLight = true, this.type = "AmbientLight";
    }
  }
  let t0 = class {
    constructor(t = true) {
      this.autoStart = t, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = false;
    }
    start() {
      this.startTime = Hl(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = true;
    }
    stop() {
      this.getElapsedTime(), this.running = false, this.autoStart = false;
    }
    getElapsedTime() {
      return this.getDelta(), this.elapsedTime;
    }
    getDelta() {
      let t = 0;
      if (this.autoStart && !this.running) return this.start(), 0;
      if (this.running) {
        const e = Hl();
        t = (e - this.oldTime) / 1e3, this.oldTime = e, this.elapsedTime += t;
      }
      return t;
    }
  };
  function Hl() {
    return performance.now();
  }
  const Gl = new Zt();
  class e0 {
    constructor(t, e, n = 0, s = 1 / 0) {
      this.ray = new is(t, e), this.near = n, this.far = s, this.camera = null, this.layers = new Ya(), this.params = {
        Mesh: {},
        Line: {
          threshold: 1
        },
        LOD: {},
        Points: {
          threshold: 1
        },
        Sprite: {}
      };
    }
    set(t, e) {
      this.ray.set(t, e);
    }
    setFromCamera(t, e) {
      e.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(t.x, t.y, 0.5).unproject(e).sub(this.ray.origin).normalize(), this.camera = e) : e.isOrthographicCamera ? (this.ray.origin.set(t.x, t.y, (e.near + e.far) / (e.near - e.far)).unproject(e), this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld), this.camera = e) : console.error("THREE.Raycaster: Unsupported camera type: " + e.type);
    }
    setFromXRController(t) {
      return Gl.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Gl), this;
    }
    intersectObject(t, e = true, n = []) {
      return Da(t, this, n, e), n.sort(Vl), n;
    }
    intersectObjects(t, e = true, n = []) {
      for (let s = 0, r = t.length; s < r; s++) Da(t[s], this, n, e);
      return n.sort(Vl), n;
    }
  }
  function Vl(i, t) {
    return i.distance - t.distance;
  }
  function Da(i, t, e, n) {
    let s = true;
    if (i.layers.test(t.layers) && i.raycast(t, e) === false && (s = false), s === true && n === true) {
      const r = i.children;
      for (let a = 0, o = r.length; a < o; a++) Da(r[a], t, e, true);
    }
  }
  class Wl {
    constructor(t = 1, e = 0, n = 0) {
      return this.radius = t, this.phi = e, this.theta = n, this;
    }
    set(t, e, n) {
      return this.radius = t, this.phi = e, this.theta = n, this;
    }
    copy(t) {
      return this.radius = t.radius, this.phi = t.phi, this.theta = t.theta, this;
    }
    makeSafe() {
      return this.phi = Math.max(1e-6, Math.min(Math.PI - 1e-6, this.phi)), this;
    }
    setFromVector3(t) {
      return this.setFromCartesianCoords(t.x, t.y, t.z);
    }
    setFromCartesianCoords(t, e, n) {
      return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Ee(e / this.radius, -1, 1))), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  class n0 extends jn {
    constructor(t, e = null) {
      super(), this.object = t, this.domElement = e, this.enabled = true, this.state = -1, this.keys = {}, this.mouseButtons = {
        LEFT: null,
        MIDDLE: null,
        RIGHT: null
      }, this.touches = {
        ONE: null,
        TWO: null
      };
    }
    connect() {
    }
    disconnect() {
    }
    dispose() {
    }
    update() {
    }
  }
  typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
    detail: {
      revision: Oa
    }
  }));
  typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Oa);
  const i0 = 8, s0 = 50;
  function ah(i) {
    const t = gc(i);
    return t >= s0 ? "info.gasGiant.title" : t >= i0 ? "info.iceGiant.title" : "info.rockyPlanet.title";
  }
  function r0(i) {
    return i.kind === "star" ? a0(i) : l0(i);
  }
  function a0(i) {
    switch (i.stage) {
      case X.DustCloud:
      case X.ProtostarCoalescence:
        return {
          titleId: "info.protostar.title",
          descId: "info.protostar.desc"
        };
      case X.FusionIgnition:
      case X.MainSequence:
        return {
          titleId: "info.mainSequenceStar.title",
          descId: "info.mainSequenceStar.desc"
        };
      case X.RedGiant:
        return {
          titleId: "info.redGiant.title",
          descId: "info.redGiant.desc"
        };
      case X.Death:
        return {
          titleId: "info.dyingStar.title",
          descId: "info.dyingStar.desc"
        };
      case X.Remnant:
        return o0(i.remnant);
      default:
        return {
          titleId: "info.mainSequenceStar.title",
          descId: "info.mainSequenceStar.desc"
        };
    }
  }
  function o0(i) {
    switch (i) {
      case he.NeutronStar:
        return {
          titleId: "info.neutronStar.title",
          descId: "info.neutronStar.desc"
        };
      case he.Pulsar:
        return {
          titleId: "info.pulsar.title",
          descId: "info.pulsar.desc"
        };
      case he.WhiteDwarf:
      default:
        return {
          titleId: "info.whiteDwarf.title",
          descId: "info.whiteDwarf.desc"
        };
    }
  }
  function l0(i) {
    const t = i.captured ? "info.note.captured" : "info.note.passing";
    switch (i.type) {
      case wt.Comet:
        return {
          titleId: "info.comet.title",
          descId: "info.comet.desc",
          noteId: t
        };
      case wt.Asteroid:
        return {
          titleId: "info.asteroid.title",
          descId: "info.asteroid.desc",
          noteId: t
        };
      case wt.Planet:
      case wt.Protoplanet:
      default: {
        const e = ah(i.mass ?? 0), n = `${e.slice(0, -6)}.desc`;
        return {
          titleId: e,
          descId: n
        };
      }
    }
  }
  function en(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  function wn(i) {
    const t = en(i, 1e3, 4e4) / 100;
    let e, n, s;
    return t <= 66 ? (e = 255, n = 99.4708025861 * Math.log(t) - 161.1195681661) : (e = 329.698727446 * Math.pow(t - 60, -0.1332047592), n = 288.1221695283 * Math.pow(t - 60, -0.0755148492)), t >= 66 ? s = 255 : t <= 19 ? s = 0 : s = 138.5177312231 * Math.log(t - 10) - 305.0447927307, {
      r: en(e, 0, 255) / 255,
      g: en(n, 0, 255) / 255,
      b: en(s, 0, 255) / 255
    };
  }
  function Zs(i) {
    const t = Math.max(i, 1e-3);
    return en(5800 * Math.pow(t, 0.5), 2500, 4e4);
  }
  function c0(i) {
    const t = Math.max(i, 1e-3);
    return en(0.047 * Math.pow(t, 0.4), 0.02, 0.4);
  }
  const Xl = 26, oh = 0.018, ql = 0.012;
  function lh(i) {
    if (i === null) return 1;
    const t = Math.max(0, i.metals);
    return en(1 - (t - 0.02) * 1.2, 0.85, 1.12);
  }
  function h0(i, t, e = null) {
    const n = en(t, 0, 1), s = Zs(i) * lh(e), r = 1.15 - 0.25 * n;
    return en(s * r, 2500, 4e4);
  }
  function u0(i, t, e, n = null, s = null) {
    const r = en(e, 0, 1), a = Zs(t) * lh(s), o = c0(t);
    switch (i) {
      case X.DustCloud:
        return {
          visible: false,
          temperatureK: 0,
          color: {
            r: 0,
            g: 0,
            b: 0
          },
          radius: 0,
          glow: 0,
          surfaceLum: 0,
          pulsarBeam: false
        };
      case X.ProtostarCoalescence: {
        const l = 1200 + 1600 * r, c = o * (6 - 3 * r);
        return {
          visible: true,
          temperatureK: l,
          color: wn(l),
          radius: c,
          glow: 0.4 + 0.3 * r,
          surfaceLum: 0.4 + 0.15 * r,
          pulsarBeam: false
        };
      }
      case X.FusionIgnition: {
        const l = 2800 + (a - 2800) * r;
        return {
          visible: true,
          temperatureK: l,
          color: wn(l),
          radius: o,
          glow: 0.8 + 0.6 * r,
          surfaceLum: 0.55 + 0.35 * r,
          pulsarBeam: false
        };
      }
      case X.MainSequence: {
        const l = h0(t, r, s);
        return {
          visible: true,
          temperatureK: l,
          color: wn(l),
          radius: o,
          glow: 1,
          surfaceLum: 0.9,
          pulsarBeam: false
        };
      }
      case X.RedGiant: {
        const l = Math.sqrt(r), c = a + (3100 - a) * l, h = o * (1 + (Xl - 1) * r);
        return {
          visible: true,
          temperatureK: c,
          color: wn(c),
          radius: h,
          glow: 1 + 0.5 * r,
          surfaceLum: 0.45 - 0.2 * l,
          pulsarBeam: false
        };
      }
      case X.Death: {
        const c = o * Xl * (1 - 0.94 * r);
        return {
          visible: true,
          temperatureK: 8e3,
          color: wn(8e3),
          radius: Math.max(c, oh),
          glow: 2.5,
          surfaceLum: 1,
          pulsarBeam: false
        };
      }
      case X.Remnant:
        return d0(n);
      default:
        return {
          visible: false,
          temperatureK: 0,
          color: {
            r: 0,
            g: 0,
            b: 0
          },
          radius: 0,
          glow: 0,
          surfaceLum: 0,
          pulsarBeam: false
        };
    }
  }
  function d0(i) {
    switch (i) {
      case he.WhiteDwarf:
        return {
          visible: true,
          temperatureK: 7200,
          color: wn(7200),
          radius: oh,
          glow: 1.2,
          surfaceLum: 0.95,
          pulsarBeam: false
        };
      case he.NeutronStar:
        return {
          visible: true,
          temperatureK: 3e4,
          color: wn(3e4),
          radius: ql,
          glow: 2,
          surfaceLum: 1,
          pulsarBeam: false
        };
      case he.Pulsar:
        return {
          visible: true,
          temperatureK: 34e3,
          color: wn(34e3),
          radius: ql,
          glow: 2.2,
          surfaceLum: 1,
          pulsarBeam: true
        };
      default:
        return {
          visible: false,
          temperatureK: 0,
          color: {
            r: 0,
            g: 0,
            b: 0
          },
          radius: 0,
          glow: 0,
          surfaceLum: 0,
          pulsarBeam: false
        };
    }
  }
  function Ia(i) {
    return !Number.isFinite(i) || i <= 0 ? "\u2014" : i >= 1e6 ? `${(i / 1e6).toPrecision(3)} MK` : i >= 1e4 ? `${Math.round(i / 100) / 10} kK` : `${Math.round(i)} K`;
  }
  function ch(i) {
    if (!Number.isFinite(i) || i <= 0) return "\u2014";
    if (i < 0.05) {
      const t = gc(i);
      return t >= 1e3 ? `${Math.round(t).toLocaleString("en-US")} M\u2295` : `${t >= 10 ? Math.round(t) : Number(t.toPrecision(2))} M\u2295`;
    }
    return `${Number(i.toPrecision(3))} M\u2609`;
  }
  function f0(i) {
    return !Number.isFinite(i) || i <= 0 ? "\u2014" : `${i >= 100 ? Math.round(i) : Number(i.toPrecision(3))} km/s`;
  }
  function p0(i) {
    const t = Fa(i);
    return t > 0 ? `${t >= 10 ? Math.round(t) : Number(t.toPrecision(2))} AU` : "\u2014";
  }
  function hh(i, t, e) {
    switch (i) {
      case X.DustCloud:
        return 20;
      case X.ProtostarCoalescence:
        return 2500;
      case X.FusionIgnition:
        return 4e3;
      case X.MainSequence:
        return Zs(t);
      case X.RedGiant:
        return 3300;
      case X.Death:
        return 8e3;
      case X.Remnant:
        switch (e) {
          case he.NeutronStar:
            return 6e5;
          case he.Pulsar:
            return 8e5;
          case he.WhiteDwarf:
          default:
            return 15e3;
        }
      default:
        return Zs(t);
    }
  }
  function m0(i, t, e) {
    const n = hh(i, t, e), s = qh(i, t, e);
    return {
      titleId: g0(i, e),
      stats: [
        {
          labelId: "label.stat.mass",
          value: ch(t)
        },
        {
          labelId: "label.stat.coreTemp",
          value: Ia(s)
        },
        {
          labelId: "label.stat.surfaceTemp",
          value: Ia(n)
        }
      ]
    };
  }
  function g0(i, t) {
    switch (i) {
      case X.DustCloud:
      case X.ProtostarCoalescence:
        return "info.protostar.title";
      case X.RedGiant:
        return "info.redGiant.title";
      case X.Death:
        return "info.dyingStar.title";
      case X.Remnant:
        switch (t) {
          case he.NeutronStar:
            return "info.neutronStar.title";
          case he.Pulsar:
            return "info.pulsar.title";
          case he.WhiteDwarf:
          default:
            return "info.whiteDwarf.title";
        }
      default:
        return "info.mainSequenceStar.title";
    }
  }
  function _0(i, t, e) {
    const n = Fa(i.distanceScene), s = Wh(t), r = Xh(e, s, n, 0.3), a = Vh(t, n);
    return {
      titleId: v0(i),
      titleValues: {
        id: i.id
      },
      stats: [
        {
          labelId: "label.stat.mass",
          value: ch(i.mass)
        },
        {
          labelId: "label.stat.surfaceTemp",
          value: Ia(r)
        },
        {
          labelId: "label.stat.velocity",
          value: f0(a)
        },
        {
          labelId: "label.stat.distance",
          value: p0(i.distanceScene)
        }
      ]
    };
  }
  function v0(i) {
    switch (i.type) {
      case wt.Comet:
        return "info.comet.title";
      case wt.Asteroid:
        return "info.asteroid.title";
      case wt.Protoplanet:
        return "info.protoplanet.title";
      case wt.Planet:
      default:
        return ah(i.mass);
    }
  }
  const Yl = 48, x0 = 900;
  class M0 {
    container;
    i18n;
    locale;
    pool = [];
    projected = new R();
    enabled = true;
    constructor(t) {
      this.container = t.container, this.i18n = t.i18n ?? Yn, this.locale = t.locale;
    }
    setEnabled(t) {
      if (this.enabled = t, !t) for (const e of this.pool) e.root.style.display = "none";
    }
    get isEnabled() {
      return this.enabled;
    }
    setLocale(t) {
      this.locale = t;
      for (const e of this.pool) e.signature = "";
    }
    update(t, e, n, s, r, a, o, l) {
      if (!this.enabled) return;
      const c = s.clientWidth, h = s.clientHeight;
      if (c === 0 || h === 0) return;
      let d = 0;
      d = this.place(d, [
        0,
        Math.max(l, 0.4),
        0
      ], m0(r, a, o), n, c, h, true);
      const f = hh(r, a, o);
      for (let p = 0; p < e && d < Yl; p += 1) {
        const g = p * Ke, v = t[g + Tt.x] ?? 0, m = t[g + Tt.y] ?? 0, u = t[g + Tt.z] ?? 0, b = t[g + Tt.radius] ?? 0.1, E = _0({
          id: Math.round(t[g + Tt.id] ?? 0),
          type: Math.round(t[g + Tt.type] ?? 0),
          mass: t[g + Tt.mass] ?? 0,
          distanceScene: Math.hypot(v, m, u)
        }, a, f);
        d = this.place(d, [
          v,
          m + b + 0.25,
          u
        ], E, n, c, h, false);
      }
      for (let p = d; p < this.pool.length; p += 1) this.pool[p].root.style.display = "none";
    }
    place(t, e, n, s, r, a, o) {
      if (t >= Yl) return t;
      this.projected.set(e[0], e[1], e[2]);
      const l = this.projected.distanceTo(s.position);
      this.projected.project(s);
      const c = this.node(t);
      if (this.projected.z > 1 || this.projected.x < -1.1 || this.projected.x > 1.1 || this.projected.y < -1.1 || this.projected.y > 1.1 || l > x0) return c.root.style.display = "none", t + 1;
      const d = (this.projected.x * 0.5 + 0.5) * r, f = (-this.projected.y * 0.5 + 0.5) * a;
      return c.root.style.display = "", c.root.style.transform = `translate(-50%, -100%) translate(${d.toFixed(1)}px, ${f.toFixed(1)}px)`, c.root.classList.toggle("body-label--star", o), this.fill(c, n), t + 1;
    }
    fill(t, e) {
      const n = `${e.titleId}|${e.titleValues?.id ?? ""}|${e.stats.map((s) => `${s.labelId}=${s.value}`).join(",")}`;
      if (t.signature !== n) {
        t.signature = n, t.title.textContent = this.i18n.translate(this.locale, e.titleId, e.titleValues ?? {}), t.stats.replaceChildren();
        for (const s of e.stats) {
          const r = document.createElement("div");
          r.className = "body-label__stat";
          const a = document.createElement("span");
          a.className = "body-label__stat-key", a.textContent = this.i18n.translate(this.locale, s.labelId);
          const o = document.createElement("span");
          o.className = "body-label__stat-value", o.textContent = s.value, r.append(a, o), t.stats.appendChild(r);
        }
      }
    }
    node(t) {
      const e = this.pool[t];
      if (e !== void 0) return e;
      const n = document.createElement("div");
      n.className = "body-label";
      const s = document.createElement("div");
      s.className = "body-label__title";
      const r = document.createElement("div");
      r.className = "body-label__stats", n.append(s, r), this.container.appendChild(n);
      const a = {
        root: n,
        title: s,
        stats: r,
        signature: ""
      };
      return this.pool[t] = a, a;
    }
    dispose() {
      for (const t of this.pool) t.root.remove();
      this.pool.length = 0;
    }
  }
  function uh(i) {
    return Math.hypot(i[0], i[1], i[2]);
  }
  function S0(i, t) {
    const e = i[0] - t[0], n = i[1] - t[1], s = i[2] - t[2], r = Math.hypot(e, n, s);
    return r <= 1e-9 ? [
      1,
      0,
      0
    ] : [
      e / r,
      n / r,
      s / r
    ];
  }
  function y0(i, t, e) {
    const s = 1 / (1 + uh([
      i[0] - t[0],
      i[1] - t[1],
      i[2] - t[2]
    ]) * 0.15);
    return Math.max(0, Math.min(e, e * s));
  }
  function E0(i, t, e) {
    if (!(e > 0)) return 0;
    const n = uh([
      i[0] - t[0],
      i[1] - t[1],
      i[2] - t[2]
    ]), s = (e - n) / (e * 0.6);
    return Math.max(0, Math.min(1, s));
  }
  function b0(i, t, e) {
    const n = i + t * e, s = Math.PI * 2, r = n % s;
    return r < 0 ? r + s : r;
  }
  function T0(i, t, e, n) {
    if (!(i > 0) || !(t > 0) || !(e > 0) || !(n > 0) || t >= 180) return 0;
    const s = t * Math.PI / 180 / 2;
    return n * i * Math.tan(s) / e;
  }
  function La(i, t, e, n, s) {
    const r = T0(t, e, n, s);
    return Math.max(Math.max(i, 0), r);
  }
  const A0 = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, w0 = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    // uv.y runs 0 (head, at the comet) \u2192 1 (tail tip).
    float along = 1.0 - vUv.y;
    // Narrow the tail toward the tip and fade transparency.
    float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float body = across * along;
    float alpha = pow(body, 1.5) * uOpacity;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`, jl = 32, Os = 48, Kl = 48, Zl = 96, C0 = new R(0, 1, 0), R0 = 2.5, Br = 7, P0 = 4;
  function D0(i, t) {
    return t !== wt.Planet && t !== wt.Protoplanet ? 0 : 1 + Math.abs(Math.round(i)) % 2;
  }
  class I0 {
    group;
    planets;
    comets;
    asteroids;
    moons;
    tails;
    tailMaterial;
    dummy = new ve();
    spinAngles = /* @__PURE__ */ new Map();
    starPos = [
      0,
      0,
      0
    ];
    moonElapsed = 0;
    tailActivationDistance = 25;
    camera = null;
    viewportHeightPx = 0;
    constructor() {
      this.group = new Cn();
      const t = new Nr({
        color: 8956671,
        roughness: 0.8,
        metalness: 0.1
      });
      this.planets = new Yi(new bi(1, 24, 24), t, jl), this.planets.instanceMatrix.setUsage(pi), this.planets.count = 0, this.planets.frustumCulled = false, this.group.add(this.planets);
      const e = new ss({
        color: 4874354
      });
      this.comets = new Yi(new bi(1, 12, 12), e, Os), this.comets.instanceMatrix.setUsage(pi), this.comets.count = 0, this.comets.frustumCulled = false, this.group.add(this.comets);
      const n = new Nr({
        color: 10130568,
        roughness: 1,
        metalness: 0
      });
      this.moons = new Yi(new bi(1, 12, 12), n, Zl), this.moons.instanceMatrix.setUsage(pi), this.moons.count = 0, this.moons.frustumCulled = false, this.group.add(this.moons);
      const s = new Nr({
        color: 9075302,
        roughness: 1,
        metalness: 0
      });
      this.asteroids = new Yi(new Qa(1, 0), s, Kl), this.asteroids.instanceMatrix.setUsage(pi), this.asteroids.count = 0, this.asteroids.frustumCulled = false, this.group.add(this.asteroids);
      const r = new Ui(1, 1);
      r.translate(0, 0.5, 0), this.tailMaterial = new de({
        uniforms: {
          uColor: {
            value: new Pt(0.7, 0.85, 1)
          },
          uOpacity: {
            value: 0.9
          }
        },
        vertexShader: A0,
        fragmentShader: w0,
        transparent: true,
        blending: Wn,
        depthWrite: false,
        side: qe
      }), this.tails = new Yi(r, this.tailMaterial, Os), this.tails.instanceMatrix.setUsage(pi), this.tails.count = 0, this.tails.frustumCulled = false, this.group.add(this.tails);
    }
    update(t, e, n, s, r) {
      this.camera = s ?? null, this.viewportHeightPx = r ?? 0, Number.isFinite(n) && n > 0 && (this.moonElapsed += n);
      let a = 0, o = 0, l = 0, c = 0, h = 0;
      const d = /* @__PURE__ */ new Set();
      for (let f = 0; f < e; f += 1) {
        const p = f * Ke, g = t[p + Tt.id] ?? 0, v = Math.round(t[p + Tt.type] ?? 0), m = t[p + Tt.radius] ?? 0.5, u = [
          t[p + Tt.x] ?? 0,
          t[p + Tt.y] ?? 0,
          t[p + Tt.z] ?? 0
        ], b = t[p + Tt.spin] ?? 0;
        d.add(g);
        const E = b0(this.spinAngles.get(g) ?? 0, b, n);
        switch (this.spinAngles.set(g, E), v) {
          case wt.Comet:
            o = this.writeInstance(this.comets, o, u, m, E, Os), h = this.writeTail(h, u, m);
            break;
          case wt.Asteroid:
            l = this.writeInstance(this.asteroids, l, u, m, E, Kl);
            break;
          case wt.Protoplanet:
          case wt.Planet:
          default:
            a = this.writeInstance(this.planets, a, u, m, E, jl), c = this.writeMoons(c, g, v, u, m);
            break;
        }
      }
      this.finalize(this.planets, a), this.finalize(this.comets, o), this.finalize(this.asteroids, l), this.finalize(this.moons, c), this.finalize(this.tails, h);
      for (const f of this.spinAngles.keys()) d.has(f) || this.spinAngles.delete(f);
    }
    drawnRadius(t, e, n) {
      const s = this.camera;
      if (s === null || this.viewportHeightPx <= 0) return Math.max(e, 0);
      const r = Math.hypot(t[0] - s.position.x, t[1] - s.position.y, t[2] - s.position.z);
      return La(e, r, s.fov, this.viewportHeightPx, n);
    }
    writeInstance(t, e, n, s, r, a) {
      return e >= a ? e : (this.dummy.position.set(n[0], n[1], n[2]), this.dummy.rotation.set(0, r, 0), this.dummy.scale.setScalar(this.drawnRadius(n, s, Br)), this.dummy.updateMatrix(), t.setMatrixAt(e, this.dummy.matrix), e + 1);
    }
    writeMoons(t, e, n, s, r) {
      const a = D0(e, n);
      let o = t;
      for (let l = 0; l < a && o < Zl; l += 1) {
        const c = Math.sin((Math.abs(e) + 1) * 12.9898 + l * 78.233) * 43758.5453, h = (c - Math.floor(c)) * Math.PI * 2, d = 0.25 + 0.5 * ((Math.abs(e) + l) % 3) * 0.1, f = r * (2.3 + 1.4 * l), p = 0.9 / (1 + l) + 0.15 * ((Math.abs(e) + l) % 2), g = h + this.moonElapsed * p, v = Math.cos(g) * f, m = Math.sin(g) * f, u = Math.sin(g) * f * Math.sin(d), b = [
          s[0] + v,
          s[1] + u,
          s[2] + m
        ];
        if (this.drawnRadius(s, r, Br) > f * 0.8) continue;
        const E = this.drawnRadius(b, r * (0.16 + 0.05 * l), P0);
        this.dummy.position.set(b[0], b[1], b[2]), this.dummy.rotation.set(0, g, 0), this.dummy.scale.setScalar(E), this.dummy.updateMatrix(), this.moons.setMatrixAt(o, this.dummy.matrix), o += 1;
      }
      return o;
    }
    setTailActivationDistance(t) {
      Number.isFinite(t) && t > 0 && (this.tailActivationDistance = t);
    }
    writeTail(t, e, n) {
      if (t >= Os) return t;
      const s = E0(e, this.starPos, this.tailActivationDistance);
      if (s <= 1e-3) return t;
      const r = S0(e, this.starPos), a = s * y0(e, this.starPos, R0);
      if (a <= 1e-3) return t;
      this.dummy.position.set(e[0], e[1], e[2]), this.dummy.quaternion.setFromUnitVectors(C0, new R(r[0], r[1], r[2]));
      const o = this.drawnRadius(e, n, Br) * 4 * (0.5 + 0.5 * s);
      return this.dummy.scale.set(o, a, 1), this.dummy.updateMatrix(), this.tails.setMatrixAt(t, this.dummy.matrix), t + 1;
    }
    finalize(t, e) {
      t.count = e, t.instanceMatrix.needsUpdate = true;
    }
    dispose() {
      for (const t of [
        this.planets,
        this.comets,
        this.asteroids,
        this.moons,
        this.tails
      ]) {
        t.geometry.dispose();
        const e = t.material;
        Array.isArray(e) ? e.forEach((n) => n.dispose()) : e.dispose();
      }
      this.spinAngles.clear();
    }
  }
  function $l(i, t) {
    return [
      i[1] * t[2] - i[2] * t[1],
      i[2] * t[0] - i[0] * t[2],
      i[0] * t[1] - i[1] * t[0]
    ];
  }
  function Jl(i, t) {
    return i[0] * t[0] + i[1] * t[1] + i[2] * t[2];
  }
  function vi(i) {
    return Math.hypot(i[0], i[1], i[2]);
  }
  function L0(i, t) {
    return [
      i[0] * t,
      i[1] * t,
      i[2] * t
    ];
  }
  function zr(i) {
    const t = vi(i);
    return t > 1e-12 ? L0(i, 1 / t) : null;
  }
  function U0(i, t, e) {
    const n = vi(i);
    if (!(n > 1e-9) || !(e > 0)) return null;
    const s = $l(i, t), r = vi(s);
    if (!(r > 1e-6 * n * vi(t))) return null;
    const a = Jl(t, t), o = Jl(i, t), l = [
      ((a - e / n) * i[0] - o * t[0]) / e,
      ((a - e / n) * i[1] - o * t[1]) / e,
      ((a - e / n) * i[2] - o * t[2]) / e
    ], c = vi(l), h = r * r / e, d = zr(l) ?? zr(i), f = zr(s);
    if (d === null || f === null) return null;
    const p = $l(f, d);
    return {
      eccentricity: c,
      semiLatusRectum: h,
      periapsisDir: d,
      inPlaneDir: p,
      bound: c < 1
    };
  }
  function N0(i, t, e, n = {}) {
    const s = U0(i, t, e);
    if (s === null) return new Float32Array(0);
    const r = Math.max(8, Math.floor(n.segments ?? 128)), a = n.maxRadius ?? 4e3, { eccentricity: o, semiLatusRectum: l, periapsisDir: c, inPlaneDir: h } = s;
    if (!(l / (1 + o) > 1e-3 * vi(i))) return new Float32Array(0);
    let f, p;
    if (s.bound) f = 0, p = Math.PI * 2;
    else {
      const m = Math.min(Math.max(n.hyperbolicSpan ?? 0.85, 0.05), 0.98), u = Math.acos(Math.max(-1, -1 / Math.max(o, 1.0000001))) * m;
      f = -u, p = u;
    }
    const g = r + 1, v = new Float32Array(g * 3);
    for (let m = 0; m < g; m += 1) {
      const u = f + (p - f) * m / r, b = 1 + o * Math.cos(u), E = b > 1e-6 ? Math.min(l / b, a) : a, S = Math.cos(u) * E, N = Math.sin(u) * E;
      v[m * 3] = c[0] * S + h[0] * N, v[m * 3 + 1] = c[1] * S + h[1] * N, v[m * 3 + 2] = c[2] * S + h[2] * N;
    }
    return v;
  }
  const F0 = 64, Ql = 160, O0 = 0.55, kr = {
    [wt.Protoplanet]: 7309e3,
    [wt.Planet]: 9414888,
    [wt.Comet]: 7330024,
    [wt.Asteroid]: 12165508
  };
  class B0 {
    group;
    pool = [];
    enabled = false;
    maxRadius = 400;
    constructor() {
      this.group = new Cn(), this.group.visible = false;
    }
    setMaxRadius(t) {
      Number.isFinite(t) && t > 0 && (this.maxRadius = t);
    }
    setEnabled(t) {
      this.enabled = t, this.group.visible = t;
    }
    get isEnabled() {
      return this.enabled;
    }
    update(t, e, n) {
      if (!this.enabled) return;
      let s = 0;
      for (let r = 0; r < e && s < F0; r += 1) {
        const a = r * Ke, o = [
          t[a + Tt.x] ?? 0,
          t[a + Tt.y] ?? 0,
          t[a + Tt.z] ?? 0
        ], l = [
          t[a + Tt.vx] ?? 0,
          t[a + Tt.vy] ?? 0,
          t[a + Tt.vz] ?? 0
        ], c = N0(o, l, n, {
          segments: Ql,
          hyperbolicSpan: O0,
          maxRadius: this.maxRadius
        });
        if (c.length === 0) continue;
        const h = Math.round(t[a + Tt.type] ?? 0);
        this.writeOrbit(s, c, kr[h] ?? kr[wt.Planet]), s += 1;
      }
      for (let r = s; r < this.pool.length; r += 1) this.pool[r].line.visible = false;
    }
    writeOrbit(t, e, n) {
      const s = this.line(t);
      s.positions.set(e.subarray(0, Math.min(e.length, s.positions.length)));
      for (let a = e.length; a < s.positions.length; a += 3) s.positions[a] = e[e.length - 3] ?? 0, s.positions[a + 1] = e[e.length - 2] ?? 0, s.positions[a + 2] = e[e.length - 1] ?? 0;
      const r = s.geometry.getAttribute("position");
      r.needsUpdate = true, s.material.color.setHex(n), s.line.visible = true;
    }
    line(t) {
      const e = this.pool[t];
      if (e !== void 0) return e;
      const n = new Float32Array((Ql + 1) * 3), s = new be(), r = new xe(n, 3);
      r.setUsage(pi), s.setAttribute("position", r);
      const a = new nh({
        color: kr[wt.Planet],
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      }), o = new j_(s, a);
      o.frustumCulled = false, this.group.add(o);
      const l = {
        line: o,
        geometry: s,
        material: a,
        positions: n
      };
      return this.pool[t] = l, l;
    }
    dispose() {
      for (const t of this.pool) t.geometry.dispose(), t.material.dispose(), this.group.remove(t.line);
      this.pool.length = 0;
    }
  }
  const tc = {
    type: "change"
  }, to = {
    type: "start"
  }, dh = {
    type: "end"
  }, Bs = new is(), ec = new Tn(), z0 = Math.cos(70 * zc.DEG2RAD), ue = new R(), Re = 2 * Math.PI, $t = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  }, Hr = 1e-6;
  class k0 extends n0 {
    constructor(t, e = null) {
      super(t, e), this.state = $t.NONE, this.enabled = true, this.target = new R(), this.cursor = new R(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = false, this.dampingFactor = 0.05, this.enableZoom = true, this.zoomSpeed = 1, this.enableRotate = true, this.rotateSpeed = 1, this.enablePan = true, this.panSpeed = 1, this.screenSpacePanning = true, this.keyPanSpeed = 7, this.zoomToCursor = false, this.autoRotate = false, this.autoRotateSpeed = 2, this.keys = {
        LEFT: "ArrowLeft",
        UP: "ArrowUp",
        RIGHT: "ArrowRight",
        BOTTOM: "ArrowDown"
      }, this.mouseButtons = {
        LEFT: Mi.ROTATE,
        MIDDLE: Mi.DOLLY,
        RIGHT: Mi.PAN
      }, this.touches = {
        ONE: gi.ROTATE,
        TWO: gi.DOLLY_PAN
      }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new R(), this._lastQuaternion = new qn(), this._lastTargetPosition = new R(), this._quat = new qn().setFromUnitVectors(t.up, new R(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new Wl(), this._sphericalDelta = new Wl(), this._scale = 1, this._panOffset = new R(), this._rotateStart = new _t(), this._rotateEnd = new _t(), this._rotateDelta = new _t(), this._panStart = new _t(), this._panEnd = new _t(), this._panDelta = new _t(), this._dollyStart = new _t(), this._dollyEnd = new _t(), this._dollyDelta = new _t(), this._dollyDirection = new R(), this._mouse = new _t(), this._performCursorZoom = false, this._pointers = [], this._pointerPositions = {}, this._controlActive = false, this._onPointerMove = G0.bind(this), this._onPointerDown = H0.bind(this), this._onPointerUp = V0.bind(this), this._onContextMenu = Z0.bind(this), this._onMouseWheel = q0.bind(this), this._onKeyDown = Y0.bind(this), this._onTouchStart = j0.bind(this), this._onTouchMove = K0.bind(this), this._onMouseDown = W0.bind(this), this._onMouseMove = X0.bind(this), this._interceptControlDown = $0.bind(this), this._interceptControlUp = J0.bind(this), this.domElement !== null && this.connect(), this.update();
    }
    connect() {
      this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, {
        passive: false
      }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, {
        passive: true,
        capture: true
      }), this.domElement.style.touchAction = "none";
    }
    disconnect() {
      this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, {
        capture: true
      }), this.domElement.style.touchAction = "auto";
    }
    dispose() {
      this.disconnect();
    }
    getPolarAngle() {
      return this._spherical.phi;
    }
    getAzimuthalAngle() {
      return this._spherical.theta;
    }
    getDistance() {
      return this.object.position.distanceTo(this.target);
    }
    listenToKeyEvents(t) {
      t.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = t;
    }
    stopListenToKeyEvents() {
      this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
    }
    saveState() {
      this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
    }
    reset() {
      this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(tc), this.update(), this.state = $t.NONE;
    }
    update(t = null) {
      const e = this.object.position;
      ue.copy(e).sub(this.target), ue.applyQuaternion(this._quat), this._spherical.setFromVector3(ue), this.autoRotate && this.state === $t.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
      let n = this.minAzimuthAngle, s = this.maxAzimuthAngle;
      isFinite(n) && isFinite(s) && (n < -Math.PI ? n += Re : n > Math.PI && (n -= Re), s < -Math.PI ? s += Re : s > Math.PI && (s -= Re), n <= s ? this._spherical.theta = Math.max(n, Math.min(s, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + s) / 2 ? Math.max(n, this._spherical.theta) : Math.min(s, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === true ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
      let r = false;
      if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
      else {
        const a = this._spherical.radius;
        this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), r = a != this._spherical.radius;
      }
      if (ue.setFromSpherical(this._spherical), ue.applyQuaternion(this._quatInverse), e.copy(this.target).add(ue), this.object.lookAt(this.target), this.enableDamping === true ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
        let a = null;
        if (this.object.isPerspectiveCamera) {
          const o = ue.length();
          a = this._clampDistance(o * this._scale);
          const l = o - a;
          this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), r = !!l;
        } else if (this.object.isOrthographicCamera) {
          const o = new R(this._mouse.x, this._mouse.y, 0);
          o.unproject(this.object);
          const l = this.object.zoom;
          this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), r = l !== this.object.zoom;
          const c = new R(this._mouse.x, this._mouse.y, 0);
          c.unproject(this.object), this.object.position.sub(c).add(o), this.object.updateMatrixWorld(), a = ue.length();
        } else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = false;
        a !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position) : (Bs.origin.copy(this.object.position), Bs.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(Bs.direction)) < z0 ? this.object.lookAt(this.target) : (ec.setFromNormalAndCoplanarPoint(this.object.up, this.target), Bs.intersectPlane(ec, this.target))));
      } else if (this.object.isOrthographicCamera) {
        const a = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), a !== this.object.zoom && (this.object.updateProjectionMatrix(), r = true);
      }
      return this._scale = 1, this._performCursorZoom = false, r || this._lastPosition.distanceToSquared(this.object.position) > Hr || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Hr || this._lastTargetPosition.distanceToSquared(this.target) > Hr ? (this.dispatchEvent(tc), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), true) : false;
    }
    _getAutoRotationAngle(t) {
      return t !== null ? Re / 60 * this.autoRotateSpeed * t : Re / 60 / 60 * this.autoRotateSpeed;
    }
    _getZoomScale(t) {
      const e = Math.abs(t * 0.01);
      return Math.pow(0.95, this.zoomSpeed * e);
    }
    _rotateLeft(t) {
      this._sphericalDelta.theta -= t;
    }
    _rotateUp(t) {
      this._sphericalDelta.phi -= t;
    }
    _panLeft(t, e) {
      ue.setFromMatrixColumn(e, 0), ue.multiplyScalar(-t), this._panOffset.add(ue);
    }
    _panUp(t, e) {
      this.screenSpacePanning === true ? ue.setFromMatrixColumn(e, 1) : (ue.setFromMatrixColumn(e, 0), ue.crossVectors(this.object.up, ue)), ue.multiplyScalar(t), this._panOffset.add(ue);
    }
    _pan(t, e) {
      const n = this.domElement;
      if (this.object.isPerspectiveCamera) {
        const s = this.object.position;
        ue.copy(s).sub(this.target);
        let r = ue.length();
        r *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * t * r / n.clientHeight, this.object.matrix), this._panUp(2 * e * r / n.clientHeight, this.object.matrix);
      } else this.object.isOrthographicCamera ? (this._panLeft(t * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(e * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = false);
    }
    _dollyOut(t) {
      this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = false);
    }
    _dollyIn(t) {
      this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = false);
    }
    _updateZoomParameters(t, e) {
      if (!this.zoomToCursor) return;
      this._performCursorZoom = true;
      const n = this.domElement.getBoundingClientRect(), s = t - n.left, r = e - n.top, a = n.width, o = n.height;
      this._mouse.x = s / a * 2 - 1, this._mouse.y = -(r / o) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
    }
    _clampDistance(t) {
      return Math.max(this.minDistance, Math.min(this.maxDistance, t));
    }
    _handleMouseDownRotate(t) {
      this._rotateStart.set(t.clientX, t.clientY);
    }
    _handleMouseDownDolly(t) {
      this._updateZoomParameters(t.clientX, t.clientX), this._dollyStart.set(t.clientX, t.clientY);
    }
    _handleMouseDownPan(t) {
      this._panStart.set(t.clientX, t.clientY);
    }
    _handleMouseMoveRotate(t) {
      this._rotateEnd.set(t.clientX, t.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
      const e = this.domElement;
      this._rotateLeft(Re * this._rotateDelta.x / e.clientHeight), this._rotateUp(Re * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
    }
    _handleMouseMoveDolly(t) {
      this._dollyEnd.set(t.clientX, t.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
    }
    _handleMouseMovePan(t) {
      this._panEnd.set(t.clientX, t.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
    }
    _handleMouseWheel(t) {
      this._updateZoomParameters(t.clientX, t.clientY), t.deltaY < 0 ? this._dollyIn(this._getZoomScale(t.deltaY)) : t.deltaY > 0 && this._dollyOut(this._getZoomScale(t.deltaY)), this.update();
    }
    _handleKeyDown(t) {
      let e = false;
      switch (t.code) {
        case this.keys.UP:
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateUp(Re * this.rotateSpeed / this.domElement.clientHeight) : this._pan(0, this.keyPanSpeed), e = true;
          break;
        case this.keys.BOTTOM:
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateUp(-Re * this.rotateSpeed / this.domElement.clientHeight) : this._pan(0, -this.keyPanSpeed), e = true;
          break;
        case this.keys.LEFT:
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateLeft(Re * this.rotateSpeed / this.domElement.clientHeight) : this._pan(this.keyPanSpeed, 0), e = true;
          break;
        case this.keys.RIGHT:
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateLeft(-Re * this.rotateSpeed / this.domElement.clientHeight) : this._pan(-this.keyPanSpeed, 0), e = true;
          break;
      }
      e && (t.preventDefault(), this.update());
    }
    _handleTouchStartRotate(t) {
      if (this._pointers.length === 1) this._rotateStart.set(t.pageX, t.pageY);
      else {
        const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
        this._rotateStart.set(n, s);
      }
    }
    _handleTouchStartPan(t) {
      if (this._pointers.length === 1) this._panStart.set(t.pageX, t.pageY);
      else {
        const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
        this._panStart.set(n, s);
      }
    }
    _handleTouchStartDolly(t) {
      const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, s = t.pageY - e.y, r = Math.sqrt(n * n + s * s);
      this._dollyStart.set(0, r);
    }
    _handleTouchStartDollyPan(t) {
      this.enableZoom && this._handleTouchStartDolly(t), this.enablePan && this._handleTouchStartPan(t);
    }
    _handleTouchStartDollyRotate(t) {
      this.enableZoom && this._handleTouchStartDolly(t), this.enableRotate && this._handleTouchStartRotate(t);
    }
    _handleTouchMoveRotate(t) {
      if (this._pointers.length == 1) this._rotateEnd.set(t.pageX, t.pageY);
      else {
        const n = this._getSecondPointerPosition(t), s = 0.5 * (t.pageX + n.x), r = 0.5 * (t.pageY + n.y);
        this._rotateEnd.set(s, r);
      }
      this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
      const e = this.domElement;
      this._rotateLeft(Re * this._rotateDelta.x / e.clientHeight), this._rotateUp(Re * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
    }
    _handleTouchMovePan(t) {
      if (this._pointers.length === 1) this._panEnd.set(t.pageX, t.pageY);
      else {
        const e = this._getSecondPointerPosition(t), n = 0.5 * (t.pageX + e.x), s = 0.5 * (t.pageY + e.y);
        this._panEnd.set(n, s);
      }
      this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
    }
    _handleTouchMoveDolly(t) {
      const e = this._getSecondPointerPosition(t), n = t.pageX - e.x, s = t.pageY - e.y, r = Math.sqrt(n * n + s * s);
      this._dollyEnd.set(0, r), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
      const a = (t.pageX + e.x) * 0.5, o = (t.pageY + e.y) * 0.5;
      this._updateZoomParameters(a, o);
    }
    _handleTouchMoveDollyPan(t) {
      this.enableZoom && this._handleTouchMoveDolly(t), this.enablePan && this._handleTouchMovePan(t);
    }
    _handleTouchMoveDollyRotate(t) {
      this.enableZoom && this._handleTouchMoveDolly(t), this.enableRotate && this._handleTouchMoveRotate(t);
    }
    _addPointer(t) {
      this._pointers.push(t.pointerId);
    }
    _removePointer(t) {
      delete this._pointerPositions[t.pointerId];
      for (let e = 0; e < this._pointers.length; e++) if (this._pointers[e] == t.pointerId) {
        this._pointers.splice(e, 1);
        return;
      }
    }
    _isTrackingPointer(t) {
      for (let e = 0; e < this._pointers.length; e++) if (this._pointers[e] == t.pointerId) return true;
      return false;
    }
    _trackPointer(t) {
      let e = this._pointerPositions[t.pointerId];
      e === void 0 && (e = new _t(), this._pointerPositions[t.pointerId] = e), e.set(t.pageX, t.pageY);
    }
    _getSecondPointerPosition(t) {
      const e = t.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
      return this._pointerPositions[e];
    }
    _customWheelEvent(t) {
      const e = t.deltaMode, n = {
        clientX: t.clientX,
        clientY: t.clientY,
        deltaY: t.deltaY
      };
      switch (e) {
        case 1:
          n.deltaY *= 16;
          break;
        case 2:
          n.deltaY *= 100;
          break;
      }
      return t.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
    }
  }
  function H0(i) {
    this.enabled !== false && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
  }
  function G0(i) {
    this.enabled !== false && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
  }
  function V0(i) {
    switch (this._removePointer(i), this._pointers.length) {
      case 0:
        this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(dh), this.state = $t.NONE;
        break;
      case 1:
        const t = this._pointers[0], e = this._pointerPositions[t];
        this._onTouchStart({
          pointerId: t,
          pageX: e.x,
          pageY: e.y
        });
        break;
    }
  }
  function W0(i) {
    let t;
    switch (i.button) {
      case 0:
        t = this.mouseButtons.LEFT;
        break;
      case 1:
        t = this.mouseButtons.MIDDLE;
        break;
      case 2:
        t = this.mouseButtons.RIGHT;
        break;
      default:
        t = -1;
    }
    switch (t) {
      case Mi.DOLLY:
        if (this.enableZoom === false) return;
        this._handleMouseDownDolly(i), this.state = $t.DOLLY;
        break;
      case Mi.ROTATE:
        if (i.ctrlKey || i.metaKey || i.shiftKey) {
          if (this.enablePan === false) return;
          this._handleMouseDownPan(i), this.state = $t.PAN;
        } else {
          if (this.enableRotate === false) return;
          this._handleMouseDownRotate(i), this.state = $t.ROTATE;
        }
        break;
      case Mi.PAN:
        if (i.ctrlKey || i.metaKey || i.shiftKey) {
          if (this.enableRotate === false) return;
          this._handleMouseDownRotate(i), this.state = $t.ROTATE;
        } else {
          if (this.enablePan === false) return;
          this._handleMouseDownPan(i), this.state = $t.PAN;
        }
        break;
      default:
        this.state = $t.NONE;
    }
    this.state !== $t.NONE && this.dispatchEvent(to);
  }
  function X0(i) {
    switch (this.state) {
      case $t.ROTATE:
        if (this.enableRotate === false) return;
        this._handleMouseMoveRotate(i);
        break;
      case $t.DOLLY:
        if (this.enableZoom === false) return;
        this._handleMouseMoveDolly(i);
        break;
      case $t.PAN:
        if (this.enablePan === false) return;
        this._handleMouseMovePan(i);
        break;
    }
  }
  function q0(i) {
    this.enabled === false || this.enableZoom === false || this.state !== $t.NONE || (i.preventDefault(), this.dispatchEvent(to), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(dh));
  }
  function Y0(i) {
    this.enabled === false || this.enablePan === false || this._handleKeyDown(i);
  }
  function j0(i) {
    switch (this._trackPointer(i), this._pointers.length) {
      case 1:
        switch (this.touches.ONE) {
          case gi.ROTATE:
            if (this.enableRotate === false) return;
            this._handleTouchStartRotate(i), this.state = $t.TOUCH_ROTATE;
            break;
          case gi.PAN:
            if (this.enablePan === false) return;
            this._handleTouchStartPan(i), this.state = $t.TOUCH_PAN;
            break;
          default:
            this.state = $t.NONE;
        }
        break;
      case 2:
        switch (this.touches.TWO) {
          case gi.DOLLY_PAN:
            if (this.enableZoom === false && this.enablePan === false) return;
            this._handleTouchStartDollyPan(i), this.state = $t.TOUCH_DOLLY_PAN;
            break;
          case gi.DOLLY_ROTATE:
            if (this.enableZoom === false && this.enableRotate === false) return;
            this._handleTouchStartDollyRotate(i), this.state = $t.TOUCH_DOLLY_ROTATE;
            break;
          default:
            this.state = $t.NONE;
        }
        break;
      default:
        this.state = $t.NONE;
    }
    this.state !== $t.NONE && this.dispatchEvent(to);
  }
  function K0(i) {
    switch (this._trackPointer(i), this.state) {
      case $t.TOUCH_ROTATE:
        if (this.enableRotate === false) return;
        this._handleTouchMoveRotate(i), this.update();
        break;
      case $t.TOUCH_PAN:
        if (this.enablePan === false) return;
        this._handleTouchMovePan(i), this.update();
        break;
      case $t.TOUCH_DOLLY_PAN:
        if (this.enableZoom === false && this.enablePan === false) return;
        this._handleTouchMoveDollyPan(i), this.update();
        break;
      case $t.TOUCH_DOLLY_ROTATE:
        if (this.enableZoom === false && this.enableRotate === false) return;
        this._handleTouchMoveDollyRotate(i), this.update();
        break;
      default:
        this.state = $t.NONE;
    }
  }
  function Z0(i) {
    this.enabled !== false && i.preventDefault();
  }
  function $0(i) {
    i.key === "Control" && (this._controlActive = true, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
      passive: true,
      capture: true
    }));
  }
  function J0(i) {
    i.key === "Control" && (this._controlActive = false, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
      passive: true,
      capture: true
    }));
  }
  function Q0(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  function tv(i, t, e = 1.6) {
    const n = Math.max(i, 1e-4), s = Q0(t, 1, 179) * Math.PI / 180 / 2, r = Math.tan(s);
    return (r > 1e-6 ? n / r : n) * Math.max(e, 1);
  }
  function Gr(i, t, e, n) {
    if (!Number.isFinite(n) || n <= 0) return i;
    const s = 1 - Math.exp(-Math.max(0, e) * n);
    return i + (t - i) * s;
  }
  function ev(i, t, e, n) {
    return [
      Gr(i[0], t[0], e, n),
      Gr(i[1], t[1], e, n),
      Gr(i[2], t[2], e, n)
    ];
  }
  const nv = 4;
  class iv {
    camera;
    controls;
    followProvider = null;
    smoothedTarget = [
      0,
      0,
      0
    ];
    constructor(t, e) {
      this.camera = t, this.controls = new k0(t, e), this.controls.enableDamping = true, this.controls.dampingFactor = 0.08, this.controls.minDistance = 0.06, this.controls.maxDistance = 5e3;
    }
    focusOn(t, e, n = null) {
      this.followProvider = n;
      const s = tv(e, this.camera.fov, 2.2), r = new R().subVectors(this.camera.position, this.controls.target).normalize();
      r.lengthSq() < 1e-8 && r.set(0, 0.4, 1).normalize(), this.controls.target.set(t[0], t[1], t[2]), this.smoothedTarget[0] = t[0], this.smoothedTarget[1] = t[1], this.smoothedTarget[2] = t[2], this.camera.position.copy(this.controls.target).addScaledVector(r, s);
    }
    setFollow(t) {
      this.followProvider = t;
    }
    clearFollow() {
      this.followProvider = null;
    }
    zoomIn(t = 0.8) {
      this.dolly(t);
    }
    zoomOut(t = 1.25) {
      this.dolly(t);
    }
    dolly(t) {
      const e = new R().subVectors(this.camera.position, this.controls.target), n = zc.clamp(e.length() * t, this.controls.minDistance, this.controls.maxDistance);
      e.setLength(n), this.camera.position.copy(this.controls.target).add(e);
    }
    update(t) {
      const e = this.followProvider;
      if (e !== null) {
        const n = e();
        if (n !== null) {
          const s = [
            this.controls.target.x,
            this.controls.target.y,
            this.controls.target.z
          ], r = ev(s, n, nv, t), a = new R(r[0] - s[0], r[1] - s[1], r[2] - s[2]);
          this.controls.target.set(r[0], r[1], r[2]), this.camera.position.add(a), this.smoothedTarget[0] = r[0], this.smoothedTarget[1] = r[1], this.smoothedTarget[2] = r[2];
        }
      }
      this.controls.update();
    }
    dispose() {
      this.controls.dispose();
    }
  }
  const sv = `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Perspective size attenuation: nearer particles are larger. The factor is
    // kept small and the result tightly clamped so grains read as FINE dust in
    // scale with the star, never as large blobs when close to the camera.
    float pt = aSize * uSizeScale * uPixelRatio * (55.0 / -mvPosition.z);
    gl_PointSize = clamp(pt, 0.5, 4.0 * uPixelRatio);
    gl_Position = projectionMatrix * mvPosition;
  }
`, rv = `
  precision highp float;
  varying vec3 vColor;
  uniform float uBrightness;

  void main() {
    // Round soft sprite: fade to transparent at the point edge.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    // 1 - smoothstep(0, 0.5, d), not smoothstep(0.5, 0, d): GLSL leaves
    // smoothstep undefined when edge0 >= edge1 (see corona.ts).
    float alpha = (1.0 - smoothstep(0.0, 0.5, d)) * uBrightness;
    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`;
  class av {
    points;
    geometry;
    material;
    positions;
    colors;
    sizes;
    capacity;
    constructor(t, e = 1) {
      this.capacity = Math.max(1, Math.floor(t)), this.positions = new Float32Array(this.capacity * 3), this.colors = new Float32Array(this.capacity * 3), this.sizes = new Float32Array(this.capacity), this.geometry = new be(), this.geometry.setAttribute("position", new xe(this.positions, 3)), this.geometry.setAttribute("aColor", new xe(this.colors, 3)), this.geometry.setAttribute("aSize", new xe(this.sizes, 1)), this.geometry.setDrawRange(0, 0), this.material = new de({
        uniforms: {
          uPixelRatio: {
            value: e
          },
          uSizeScale: {
            value: 1
          },
          uBrightness: {
            value: 1
          }
        },
        vertexShader: sv,
        fragmentShader: rv,
        transparent: true,
        blending: Wn,
        depthWrite: false
      }), this.points = new sh(this.geometry, this.material), this.points.frustumCulled = false;
    }
    update(t, e) {
      const n = Math.min(e, this.capacity);
      for (let o = 0; o < n; o += 1) {
        const l = o * xi, c = o * 3;
        this.positions[c] = t[l + Pe.x] ?? 0, this.positions[c + 1] = t[l + Pe.y] ?? 0, this.positions[c + 2] = t[l + Pe.z] ?? 0, this.colors[c] = t[l + Pe.r] ?? 1, this.colors[c + 1] = t[l + Pe.g] ?? 1, this.colors[c + 2] = t[l + Pe.b] ?? 1, this.sizes[o] = t[l + Pe.size] ?? 1;
      }
      this.geometry.setDrawRange(0, n);
      const s = this.geometry.getAttribute("position"), r = this.geometry.getAttribute("aColor"), a = this.geometry.getAttribute("aSize");
      s.needsUpdate = true, r.needsUpdate = true, a.needsUpdate = true, this.geometry.computeBoundingSphere();
    }
    setPixelRatio(t) {
      this.material.uniforms.uPixelRatio.value = t;
    }
    setBrightness(t) {
      this.material.uniforms.uBrightness.value = Math.max(0, t);
    }
    dispose() {
      this.geometry.dispose(), this.material.dispose();
    }
  }
  const ov = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, lv = `
  precision highp float;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    // Radial distance from the quad center, 0 at the centre and 1 at the
    // inscribed circle.
    float d = length(vUv - vec2(0.5)) * 2.0;
    // Outside the inscribed circle there is no halo at all \u2014 otherwise the
    // square quad itself becomes visible.
    if (d > 1.0) discard;
    // Soft inverse falloff: bright core, long faint skirt.
    //
    // NB: written as 1 - smoothstep(0, 1, d) rather than smoothstep(1, 0, d).
    // GLSL leaves smoothstep UNDEFINED when edge0 >= edge1, and on this driver
    // the descending form returned a constant \u2014 so the corona rendered as a
    // uniformly lit SQUARE around the star. It went unnoticed while the star was
    // drawn as a huge ball, but at realistic (compact) scale the square was
    // unmistakable.
    float glow = 1.0 - smoothstep(0.0, 1.0, d);
    glow = pow(glow, 2.2);
    float alpha = glow * uIntensity;
    gl_FragColor = vec4(uColor * glow, alpha);
  }
`, cv = `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  void main() {
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`, hv = `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorCore;   // blackbody color of the surface
  uniform vec3 uColorEdge;   // slightly cooler limb color
  uniform float uGlow;       // corona intensity multiplier

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  // Hash-based value noise (cheap, tileable enough for surface granulation).
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vLocalPos) * 3.0 + vec3(0.0, uTime * 0.15, 0.0);
    float granulation = fbm(p + uTime * 0.05);
    float hotSpots = pow(granulation, 2.0);

    // Fresnel term brightens the limb into a corona rim.
    float fresnel = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.5);

    // Keep the surface close to the blackbody hue: a bounded granulation term
    // modulates brightness without pushing every channel to 1.0, otherwise the
    // ACES tone-map + bloom would desaturate all stages to the same white and
    // the stage-to-stage colour change (e.g. a red giant) would be invisible.
    vec3 surface = mix(uColorEdge, uColorCore, hotSpots) * (0.85 + 0.4 * granulation);
    // Tinted rim glow, bounded so a hot star flares white-hot at the limb while
    // a cool star's rim stays its own colour rather than blowing out.
    vec3 color = surface + uColorCore * fresnel * (0.35 + 0.35 * uGlow);

    gl_FragColor = vec4(color, 1.0);
  }
`, uv = 3, dv = 7, fv = 44;
  class pv {
    group;
    starMesh;
    starMaterial;
    corona;
    coronaMaterial;
    beam;
    beamMaterial;
    elapsed = 0;
    beamAngle = 0;
    constructor() {
      this.group = new Cn(), this.starMaterial = new de({
        uniforms: {
          uTime: {
            value: 0
          },
          uColorCore: {
            value: new Pt(1, 1, 1)
          },
          uColorEdge: {
            value: new Pt(1, 0.6, 0.3)
          },
          uGlow: {
            value: 1
          }
        },
        vertexShader: cv,
        fragmentShader: hv
      }), this.starMesh = new _e(new bi(1, 48, 48), this.starMaterial), this.group.add(this.starMesh), this.coronaMaterial = new de({
        uniforms: {
          uColor: {
            value: new Pt(1, 1, 1)
          },
          uIntensity: {
            value: 1
          }
        },
        vertexShader: ov,
        fragmentShader: lv,
        transparent: true,
        blending: Wn,
        depthWrite: false
      }), this.corona = new _e(new Ui(1, 1), this.coronaMaterial), this.corona.frustumCulled = false, this.group.add(this.corona), this.beam = new Cn(), this.beamMaterial = new ss({
        color: new Pt(0.6, 0.85, 1),
        transparent: true,
        opacity: 0.35,
        blending: Wn,
        depthWrite: false,
        side: qe
      });
      const t = new $a(1.2, 6, 24, 1, true), e = new _e(t, this.beamMaterial);
      e.position.set(0, 3, 0);
      const n = new _e(t, this.beamMaterial);
      n.position.set(0, -3, 0), n.rotation.z = Math.PI, this.beam.add(e), this.beam.add(n), this.beam.rotation.z = Math.PI / 5, this.beam.visible = false, this.group.add(this.beam);
    }
    update(t, e, n, s = 0) {
      if (this.elapsed += e, this.group.visible = t.visible, !t.visible) return;
      const r = n.position.length(), a = n instanceof De ? n : null, o = a === null || s <= 0 ? t.radius : La(t.radius, r, a.fov, s, dv);
      this.starMesh.scale.setScalar(o), this.starMaterial.uniforms.uTime.value = this.elapsed;
      const l = t.surfaceLum;
      this.starMaterial.uniforms.uColorCore.value.setRGB(t.color.r * l, t.color.g * l, t.color.b * l), this.starMaterial.uniforms.uColorEdge.value.setRGB(t.color.r * 0.7 * l, t.color.g * 0.5 * l, t.color.b * 0.4 * l), this.starMaterial.uniforms.uGlow.value = t.glow;
      const d = t.radius * (3.5 + t.glow), f = a === null || s <= 0 ? d * 2 : 2 * La(d, r, a.fov, s, fv);
      this.corona.scale.setScalar(f), this.corona.quaternion.copy(n.quaternion), this.coronaMaterial.uniforms.uColor.value.setRGB(t.color.r, t.color.g, t.color.b), this.coronaMaterial.uniforms.uIntensity.value = Math.min(1, 0.35 + t.glow * 0.25), this.beam.visible = t.pulsarBeam, t.pulsarBeam && (this.beamAngle += uv * e, this.beam.rotation.y = this.beamAngle, this.beam.scale.setScalar(o * 2.5));
    }
    dispose() {
      this.starMesh.geometry.dispose(), this.starMaterial.dispose(), this.corona.geometry.dispose(), this.coronaMaterial.dispose(), this.beamMaterial.dispose(), this.beam.children.forEach((t) => {
        t instanceof _e && t.geometry.dispose();
      });
    }
  }
  const fh = {
    name: "CopyShader",
    uniforms: {
      tDiffuse: {
        value: null
      },
      opacity: {
        value: 1
      }
    },
    vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
    fragmentShader: `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`
  };
  class Fi {
    constructor() {
      this.isPass = true, this.enabled = true, this.needsSwap = true, this.clear = false, this.renderToScreen = false;
    }
    setSize() {
    }
    render() {
      console.error("THREE.Pass: .render() must be implemented in derived pass.");
    }
    dispose() {
    }
  }
  const mv = new Zc(-1, 1, 1, -1, 0, 1);
  class gv extends be {
    constructor() {
      super(), this.setAttribute("position", new fe([
        -1,
        3,
        0,
        -1,
        -1,
        0,
        3,
        -1,
        0
      ], 3)), this.setAttribute("uv", new fe([
        0,
        2,
        0,
        0,
        2,
        0
      ], 2));
    }
  }
  const _v = new gv();
  class eo {
    constructor(t) {
      this._mesh = new _e(_v, t);
    }
    dispose() {
      this._mesh.geometry.dispose();
    }
    render(t) {
      t.render(this._mesh, mv);
    }
    get material() {
      return this._mesh.material;
    }
    set material(t) {
      this._mesh.material = t;
    }
  }
  class vv extends Fi {
    constructor(t, e) {
      super(), this.textureID = e !== void 0 ? e : "tDiffuse", t instanceof de ? (this.uniforms = t.uniforms, this.material = t) : t && (this.uniforms = ns.clone(t.uniforms), this.material = new de({
        name: t.name !== void 0 ? t.name : "unspecified",
        defines: Object.assign({}, t.defines),
        uniforms: this.uniforms,
        vertexShader: t.vertexShader,
        fragmentShader: t.fragmentShader
      })), this.fsQuad = new eo(this.material);
    }
    render(t, e, n) {
      this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture), this.fsQuad.material = this.material, this.renderToScreen ? (t.setRenderTarget(null), this.fsQuad.render(t)) : (t.setRenderTarget(e), this.clear && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), this.fsQuad.render(t));
    }
    dispose() {
      this.material.dispose(), this.fsQuad.dispose();
    }
  }
  class nc extends Fi {
    constructor(t, e) {
      super(), this.scene = t, this.camera = e, this.clear = true, this.needsSwap = false, this.inverse = false;
    }
    render(t, e, n) {
      const s = t.getContext(), r = t.state;
      r.buffers.color.setMask(false), r.buffers.depth.setMask(false), r.buffers.color.setLocked(true), r.buffers.depth.setLocked(true);
      let a, o;
      this.inverse ? (a = 0, o = 1) : (a = 1, o = 0), r.buffers.stencil.setTest(true), r.buffers.stencil.setOp(s.REPLACE, s.REPLACE, s.REPLACE), r.buffers.stencil.setFunc(s.ALWAYS, a, 4294967295), r.buffers.stencil.setClear(o), r.buffers.stencil.setLocked(true), t.setRenderTarget(n), this.clear && t.clear(), t.render(this.scene, this.camera), t.setRenderTarget(e), this.clear && t.clear(), t.render(this.scene, this.camera), r.buffers.color.setLocked(false), r.buffers.depth.setLocked(false), r.buffers.color.setMask(true), r.buffers.depth.setMask(true), r.buffers.stencil.setLocked(false), r.buffers.stencil.setFunc(s.EQUAL, 1, 4294967295), r.buffers.stencil.setOp(s.KEEP, s.KEEP, s.KEEP), r.buffers.stencil.setLocked(true);
    }
  }
  class xv extends Fi {
    constructor() {
      super(), this.needsSwap = false;
    }
    render(t) {
      t.state.buffers.stencil.setLocked(false), t.state.buffers.stencil.setTest(false);
    }
  }
  class Mv {
    constructor(t, e) {
      if (this.renderer = t, this._pixelRatio = t.getPixelRatio(), e === void 0) {
        const n = t.getSize(new _t());
        this._width = n.width, this._height = n.height, e = new Ze(this._width * this._pixelRatio, this._height * this._pixelRatio, {
          type: pn
        }), e.texture.name = "EffectComposer.rt1";
      } else this._width = e.width, this._height = e.height;
      this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = true, this.passes = [], this.copyPass = new vv(fh), this.copyPass.material.blending = fn, this.clock = new t0();
    }
    swapBuffers() {
      const t = this.readBuffer;
      this.readBuffer = this.writeBuffer, this.writeBuffer = t;
    }
    addPass(t) {
      this.passes.push(t), t.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    insertPass(t, e) {
      this.passes.splice(e, 0, t), t.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
    }
    removePass(t) {
      const e = this.passes.indexOf(t);
      e !== -1 && this.passes.splice(e, 1);
    }
    isLastEnabledPass(t) {
      for (let e = t + 1; e < this.passes.length; e++) if (this.passes[e].enabled) return false;
      return true;
    }
    render(t) {
      t === void 0 && (t = this.clock.getDelta());
      const e = this.renderer.getRenderTarget();
      let n = false;
      for (let s = 0, r = this.passes.length; s < r; s++) {
        const a = this.passes[s];
        if (a.enabled !== false) {
          if (a.renderToScreen = this.renderToScreen && this.isLastEnabledPass(s), a.render(this.renderer, this.writeBuffer, this.readBuffer, t, n), a.needsSwap) {
            if (n) {
              const o = this.renderer.getContext(), l = this.renderer.state.buffers.stencil;
              l.setFunc(o.NOTEQUAL, 1, 4294967295), this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, t), l.setFunc(o.EQUAL, 1, 4294967295);
            }
            this.swapBuffers();
          }
          nc !== void 0 && (a instanceof nc ? n = true : a instanceof xv && (n = false));
        }
      }
      this.renderer.setRenderTarget(e);
    }
    reset(t) {
      if (t === void 0) {
        const e = this.renderer.getSize(new _t());
        this._pixelRatio = this.renderer.getPixelRatio(), this._width = e.width, this._height = e.height, t = this.renderTarget1.clone(), t.setSize(this._width * this._pixelRatio, this._height * this._pixelRatio);
      }
      this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.renderTarget1 = t, this.renderTarget2 = t.clone(), this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2;
    }
    setSize(t, e) {
      this._width = t, this._height = e;
      const n = this._width * this._pixelRatio, s = this._height * this._pixelRatio;
      this.renderTarget1.setSize(n, s), this.renderTarget2.setSize(n, s);
      for (let r = 0; r < this.passes.length; r++) this.passes[r].setSize(n, s);
    }
    setPixelRatio(t) {
      this._pixelRatio = t, this.setSize(this._width, this._height);
    }
    dispose() {
      this.renderTarget1.dispose(), this.renderTarget2.dispose(), this.copyPass.dispose();
    }
  }
  class Sv extends Fi {
    constructor(t, e, n = null, s = null, r = null) {
      super(), this.scene = t, this.camera = e, this.overrideMaterial = n, this.clearColor = s, this.clearAlpha = r, this.clear = true, this.clearDepth = false, this.needsSwap = false, this._oldClearColor = new Pt();
    }
    render(t, e, n) {
      const s = t.autoClear;
      t.autoClear = false;
      let r, a;
      this.overrideMaterial !== null && (a = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (t.getClearColor(this._oldClearColor), t.setClearColor(this.clearColor, t.getClearAlpha())), this.clearAlpha !== null && (r = t.getClearAlpha(), t.setClearAlpha(this.clearAlpha)), this.clearDepth == true && t.clearDepth(), t.setRenderTarget(this.renderToScreen ? null : n), this.clear === true && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), t.render(this.scene, this.camera), this.clearColor !== null && t.setClearColor(this._oldClearColor), this.clearAlpha !== null && t.setClearAlpha(r), this.overrideMaterial !== null && (this.scene.overrideMaterial = a), t.autoClear = s;
    }
  }
  const yv = {
    uniforms: {
      tDiffuse: {
        value: null
      },
      luminosityThreshold: {
        value: 1
      },
      smoothWidth: {
        value: 1
      },
      defaultColor: {
        value: new Pt(0)
      },
      defaultOpacity: {
        value: 0
      }
    },
    vertexShader: `

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
    fragmentShader: `

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`
  };
  class Di extends Fi {
    constructor(t, e, n, s) {
      super(), this.strength = e !== void 0 ? e : 1, this.radius = n, this.threshold = s, this.resolution = t !== void 0 ? new _t(t.x, t.y) : new _t(256, 256), this.clearColor = new Pt(0, 0, 0), this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
      let r = Math.round(this.resolution.x / 2), a = Math.round(this.resolution.y / 2);
      this.renderTargetBright = new Ze(r, a, {
        type: pn
      }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = false;
      for (let d = 0; d < this.nMips; d++) {
        const f = new Ze(r, a, {
          type: pn
        });
        f.texture.name = "UnrealBloomPass.h" + d, f.texture.generateMipmaps = false, this.renderTargetsHorizontal.push(f);
        const p = new Ze(r, a, {
          type: pn
        });
        p.texture.name = "UnrealBloomPass.v" + d, p.texture.generateMipmaps = false, this.renderTargetsVertical.push(p), r = Math.round(r / 2), a = Math.round(a / 2);
      }
      const o = yv;
      this.highPassUniforms = ns.clone(o.uniforms), this.highPassUniforms.luminosityThreshold.value = s, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new de({
        uniforms: this.highPassUniforms,
        vertexShader: o.vertexShader,
        fragmentShader: o.fragmentShader
      }), this.separableBlurMaterials = [];
      const l = [
        3,
        5,
        7,
        9,
        11
      ];
      r = Math.round(this.resolution.x / 2), a = Math.round(this.resolution.y / 2);
      for (let d = 0; d < this.nMips; d++) this.separableBlurMaterials.push(this.getSeperableBlurMaterial(l[d])), this.separableBlurMaterials[d].uniforms.invSize.value = new _t(1 / r, 1 / a), r = Math.round(r / 2), a = Math.round(a / 2);
      this.compositeMaterial = this.getCompositeMaterial(this.nMips), this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture, this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture, this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture, this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture, this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture, this.compositeMaterial.uniforms.bloomStrength.value = e, this.compositeMaterial.uniforms.bloomRadius.value = 0.1;
      const c = [
        1,
        0.8,
        0.6,
        0.4,
        0.2
      ];
      this.compositeMaterial.uniforms.bloomFactors.value = c, this.bloomTintColors = [
        new R(1, 1, 1),
        new R(1, 1, 1),
        new R(1, 1, 1),
        new R(1, 1, 1),
        new R(1, 1, 1)
      ], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;
      const h = fh;
      this.copyUniforms = ns.clone(h.uniforms), this.blendMaterial = new de({
        uniforms: this.copyUniforms,
        vertexShader: h.vertexShader,
        fragmentShader: h.fragmentShader,
        blending: Wn,
        depthTest: false,
        depthWrite: false,
        transparent: true
      }), this.enabled = true, this.needsSwap = false, this._oldClearColor = new Pt(), this.oldClearAlpha = 1, this.basic = new ss(), this.fsQuad = new eo(null);
    }
    dispose() {
      for (let t = 0; t < this.renderTargetsHorizontal.length; t++) this.renderTargetsHorizontal[t].dispose();
      for (let t = 0; t < this.renderTargetsVertical.length; t++) this.renderTargetsVertical[t].dispose();
      this.renderTargetBright.dispose();
      for (let t = 0; t < this.separableBlurMaterials.length; t++) this.separableBlurMaterials[t].dispose();
      this.compositeMaterial.dispose(), this.blendMaterial.dispose(), this.basic.dispose(), this.fsQuad.dispose();
    }
    setSize(t, e) {
      let n = Math.round(t / 2), s = Math.round(e / 2);
      this.renderTargetBright.setSize(n, s);
      for (let r = 0; r < this.nMips; r++) this.renderTargetsHorizontal[r].setSize(n, s), this.renderTargetsVertical[r].setSize(n, s), this.separableBlurMaterials[r].uniforms.invSize.value = new _t(1 / n, 1 / s), n = Math.round(n / 2), s = Math.round(s / 2);
    }
    render(t, e, n, s, r) {
      t.getClearColor(this._oldClearColor), this.oldClearAlpha = t.getClearAlpha();
      const a = t.autoClear;
      t.autoClear = false, t.setClearColor(this.clearColor, 0), r && t.state.buffers.stencil.setTest(false), this.renderToScreen && (this.fsQuad.material = this.basic, this.basic.map = n.texture, t.setRenderTarget(null), t.clear(), this.fsQuad.render(t)), this.highPassUniforms.tDiffuse.value = n.texture, this.highPassUniforms.luminosityThreshold.value = this.threshold, this.fsQuad.material = this.materialHighPassFilter, t.setRenderTarget(this.renderTargetBright), t.clear(), this.fsQuad.render(t);
      let o = this.renderTargetBright;
      for (let l = 0; l < this.nMips; l++) this.fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = o.texture, this.separableBlurMaterials[l].uniforms.direction.value = Di.BlurDirectionX, t.setRenderTarget(this.renderTargetsHorizontal[l]), t.clear(), this.fsQuad.render(t), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = Di.BlurDirectionY, t.setRenderTarget(this.renderTargetsVertical[l]), t.clear(), this.fsQuad.render(t), o = this.renderTargetsVertical[l];
      this.fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, t.setRenderTarget(this.renderTargetsHorizontal[0]), t.clear(), this.fsQuad.render(t), this.fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, r && t.state.buffers.stencil.setTest(true), this.renderToScreen ? (t.setRenderTarget(null), this.fsQuad.render(t)) : (t.setRenderTarget(n), this.fsQuad.render(t)), t.setClearColor(this._oldClearColor, this.oldClearAlpha), t.autoClear = a;
    }
    getSeperableBlurMaterial(t) {
      const e = [];
      for (let n = 0; n < t; n++) e.push(0.39894 * Math.exp(-0.5 * n * n / (t * t)) / t);
      return new de({
        defines: {
          KERNEL_RADIUS: t
        },
        uniforms: {
          colorTexture: {
            value: null
          },
          invSize: {
            value: new _t(0.5, 0.5)
          },
          direction: {
            value: new _t(0.5, 0.5)
          },
          gaussianCoefficients: {
            value: e
          }
        },
        vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
        fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`
      });
    }
    getCompositeMaterial(t) {
      return new de({
        defines: {
          NUM_MIPS: t
        },
        uniforms: {
          blurTexture1: {
            value: null
          },
          blurTexture2: {
            value: null
          },
          blurTexture3: {
            value: null
          },
          blurTexture4: {
            value: null
          },
          blurTexture5: {
            value: null
          },
          bloomStrength: {
            value: 1
          },
          bloomFactors: {
            value: null
          },
          bloomTintColors: {
            value: null
          },
          bloomRadius: {
            value: 0
          }
        },
        vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
        fragmentShader: `varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`
      });
    }
  }
  Di.BlurDirectionX = new _t(1, 0);
  Di.BlurDirectionY = new _t(0, 1);
  const Ev = {
    name: "OutputShader",
    uniforms: {
      tDiffuse: {
        value: null
      },
      toneMappingExposure: {
        value: 1
      }
    },
    vertexShader: `
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
    fragmentShader: `
	
		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`
  };
  class bv extends Fi {
    constructor() {
      super();
      const t = Ev;
      this.uniforms = ns.clone(t.uniforms), this.material = new K_({
        name: t.name,
        uniforms: this.uniforms,
        vertexShader: t.vertexShader,
        fragmentShader: t.fragmentShader
      }), this.fsQuad = new eo(this.material), this._outputColorSpace = null, this._toneMapping = null;
    }
    render(t, e, n) {
      this.uniforms.tDiffuse.value = n.texture, this.uniforms.toneMappingExposure.value = t.toneMappingExposure, (this._outputColorSpace !== t.outputColorSpace || this._toneMapping !== t.toneMapping) && (this._outputColorSpace = t.outputColorSpace, this._toneMapping = t.toneMapping, this.material.defines = {}, Gt.getTransfer(this._outputColorSpace) === Kt && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === yc ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === Ec ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === bc ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === Ba ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === Tc ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === Ac && (this.material.defines.NEUTRAL_TONE_MAPPING = ""), this.material.needsUpdate = true), this.renderToScreen === true ? (t.setRenderTarget(null), this.fsQuad.render(t)) : (t.setRenderTarget(e), this.clear && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), this.fsQuad.render(t));
    }
    dispose() {
      this.material.dispose(), this.fsQuad.dispose();
    }
  }
  function Tv(i, t, e, n, s, r = {}) {
    const a = new Mv(i);
    a.setSize(n, s), a.addPass(new Sv(t, e));
    const o = new Di(new _t(n, s), r.strength ?? 0.28, r.radius ?? 0.45, r.threshold ?? 0.55);
    return a.addPass(o), a.addPass(new bv()), {
      composer: a,
      bloom: o,
      setSize(l, c) {
        a.setSize(l, c), o.setSize(l, c);
      },
      render(l) {
        a.render(l);
      },
      dispose() {
        a.dispose();
      }
    };
  }
  const ic = 0.04;
  function sc(i, t, e, n) {
    const s = i.x - e[0], r = i.y - e[1], a = i.z - e[2], o = s * t.x + r * t.y + a * t.z, l = s * s + r * r + a * a - n * n, c = o * o - l;
    if (c < 0) return null;
    const h = Math.sqrt(c), d = -o - h;
    if (d >= 0) return d;
    const f = -o + h;
    return f >= 0 ? f : null;
  }
  class Av {
    scene;
    camera;
    cameraController;
    container;
    renderer;
    starRenderer;
    particleField;
    bodyRenderer;
    orbits;
    labels;
    labelLayer;
    post;
    starLight;
    resizeHandler;
    lastBodies = new Float32Array(0);
    lastBodyCount = 0;
    lastStarRadius = 1;
    dustBrightness = 1;
    frameProvider = null;
    rafId = null;
    lastFrameTime = 0;
    constructor(t, e) {
      this.container = t;
      const n = t.clientWidth || window.innerWidth, s = t.clientHeight || window.innerHeight;
      this.renderer = new W_({
        antialias: true,
        powerPreference: "high-performance"
      }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.setSize(n, s), this.renderer.toneMapping = Ba, this.renderer.toneMappingExposure = 1.1, this.renderer.outputColorSpace = Fe, t.appendChild(this.renderer.domElement), this.scene = new X_(), this.scene.background = new Pt(65802), this.scene.add(this.createStarfield()), this.camera = new De(55, n / s, 0.02, 2e4), this.camera.position.set(0, 20, 60), this.cameraController = new iv(this.camera, this.renderer.domElement), this.starLight = new J_(16777215, 1.4, 0, 0), this.scene.add(this.starLight), this.scene.add(new Q_(3359834, 0.5)), this.starRenderer = new pv(), this.scene.add(this.starRenderer.group), this.particleField = new av(e.maxParticles, this.renderer.getPixelRatio()), this.scene.add(this.particleField.points), this.bodyRenderer = new I0(), e.cometTailDistance !== void 0 && this.bodyRenderer.setTailActivationDistance(e.cometTailDistance), this.scene.add(this.bodyRenderer.group), this.orbits = new B0(), e.orbitMaxRadius !== void 0 && this.orbits.setMaxRadius(e.orbitMaxRadius), this.scene.add(this.orbits.group), this.labelLayer = document.createElement("div"), this.labelLayer.className = "body-labels", t.appendChild(this.labelLayer), this.labels = new M0({
        container: this.labelLayer,
        locale: e.locale ?? "en",
        ...e.i18n === void 0 ? {} : {
          i18n: e.i18n
        }
      }), this.post = Tv(this.renderer, this.scene, this.camera, n, s), this.resizeHandler = () => this.resize(), window.addEventListener("resize", this.resizeHandler);
    }
    render(t, e) {
      const n = Number.isFinite(e) && e > 0 ? e : 0;
      this.particleField.update(t.particles, t.particleCount);
      const s = n > 0 ? Math.min(1, n * 1.5) : 1, r = wv(t.stage);
      this.dustBrightness += (r - this.dustBrightness) * s, this.particleField.setBrightness(this.dustBrightness);
      const a = this.renderer.domElement.clientHeight || this.container.clientHeight;
      this.bodyRenderer.update(t.bodies, t.bodyCount, n, this.camera, a), this.orbits.update(t.bodies, t.bodyCount, t.mu);
      const o = u0(t.stage, t.mass, t.stageProgress, t.remnant, t.composition);
      this.starRenderer.update(o, n, this.camera, a), this.starLight.visible = o.visible, this.starLight.color.setRGB(o.color.r, o.color.g, o.color.b), this.starLight.intensity = o.visible ? 1.1 + o.glow * 0.5 : 0, this.lastStarRadius = o.radius || 1, this.lastBodies = t.bodies, this.lastBodyCount = t.bodyCount, this.cameraController.update(n), this.post.render(n), this.labels.update(t.bodies, t.bodyCount, this.camera, this.renderer.domElement, t.stage, t.mass, t.remnant, this.lastStarRadius);
    }
    start(t) {
      if (this.rafId !== null) return;
      this.frameProvider = t, this.lastFrameTime = performance.now();
      const e = (n) => {
        this.rafId = requestAnimationFrame(e);
        const s = (n - this.lastFrameTime) / 1e3;
        this.lastFrameTime = n;
        const r = this.frameProvider?.(s) ?? null;
        r !== null && this.render(r, s);
      };
      this.rafId = requestAnimationFrame(e);
    }
    stop() {
      this.rafId !== null && (cancelAnimationFrame(this.rafId), this.rafId = null), this.frameProvider = null;
    }
    setOrbitsEnabled(t) {
      this.orbits.setEnabled(t);
    }
    get orbitsEnabled() {
      return this.orbits.isEnabled;
    }
    setLabelsEnabled(t) {
      this.labels.setEnabled(t);
    }
    get labelsEnabled() {
      return this.labels.isEnabled;
    }
    setLabelLocale(t) {
      this.labels.setLocale(t);
    }
    focusOnStar() {
      this.cameraController.focusOn([
        0,
        0,
        0
      ], this.lastStarRadius, null);
    }
    focusOnBody(t) {
      const e = this.findBody(t);
      e !== null && this.cameraController.focusOn(e.position, e.radius, () => {
        const n = this.findBody(t);
        return n === null ? null : n.position;
      });
    }
    get domElement() {
      return this.renderer.domElement;
    }
    pickAtClient(t, e) {
      const n = this.renderer.domElement.getBoundingClientRect();
      if (n.width === 0 || n.height === 0) return null;
      const s = (t - n.left) / n.width * 2 - 1, r = -((e - n.top) / n.height) * 2 + 1, a = new e0();
      a.setFromCamera(new _t(s, r), this.camera);
      const { origin: o, direction: l } = a.ray;
      let c = null, h = 1 / 0;
      const d = sc(o, l, [
        0,
        0,
        0
      ], Math.max(this.lastStarRadius * 2.5, o.length() * ic));
      d !== null && d < h && (h = d, c = {
        kind: "star"
      });
      for (let f = 0; f < this.lastBodyCount; f += 1) {
        const p = f * Ke, g = [
          this.lastBodies[p + Tt.x] ?? 0,
          this.lastBodies[p + Tt.y] ?? 0,
          this.lastBodies[p + Tt.z] ?? 0
        ], v = this.lastBodies[p + Tt.radius] ?? 0.5, m = Math.hypot(g[0] - o.x, g[1] - o.y, g[2] - o.z), u = sc(o, l, g, Math.max(v * 2, m * ic));
        u !== null && u < h && (h = u, c = {
          kind: "body",
          id: this.lastBodies[p + Tt.id] ?? -1,
          type: this.lastBodies[p + Tt.type] ?? wt.Planet,
          radius: v,
          mass: this.lastBodies[p + Tt.mass] ?? 0,
          captured: (this.lastBodies[p + Tt.captured] ?? 0) !== 0
        });
      }
      return c;
    }
    findBody(t) {
      for (let e = 0; e < this.lastBodyCount; e += 1) {
        const n = e * Ke;
        if ((this.lastBodies[n + Tt.id] ?? -1) === t) return {
          position: [
            this.lastBodies[n + Tt.x] ?? 0,
            this.lastBodies[n + Tt.y] ?? 0,
            this.lastBodies[n + Tt.z] ?? 0
          ],
          radius: this.lastBodies[n + Tt.radius] ?? 0.5
        };
      }
      return null;
    }
    resize() {
      const t = this.container.clientWidth || window.innerWidth, e = this.container.clientHeight || window.innerHeight;
      this.camera.aspect = t / e, this.camera.updateProjectionMatrix(), this.renderer.setSize(t, e), this.particleField.setPixelRatio(this.renderer.getPixelRatio()), this.post.setSize(t, e);
    }
    dispose() {
      this.stop(), window.removeEventListener("resize", this.resizeHandler), this.cameraController.dispose(), this.orbits.dispose(), this.labels.dispose(), this.labelLayer.remove(), this.starRenderer.dispose(), this.particleField.dispose(), this.bodyRenderer.dispose(), this.post.dispose(), this.renderer.dispose(), this.renderer.domElement.parentNode === this.container && this.container.removeChild(this.renderer.domElement);
    }
    createStarfield() {
      const e = new Float32Array(3e3), n = new Float32Array(1e3 * 3);
      for (let o = 0; o < 1e3; o += 1) {
        const l = 6e3 + Math.random() * 3e3, c = 2 * Math.random() - 1, h = Math.sqrt(Math.max(0, 1 - c * c)), d = 2 * Math.PI * Math.random();
        e[o * 3] = l * h * Math.cos(d), e[o * 3 + 1] = l * h * Math.sin(d), e[o * 3 + 2] = l * c;
        const f = 0.025 + Math.pow(Math.random(), 3) * 0.075, p = Math.random();
        n[o * 3] = f * (0.75 + 0.25 * p), n[o * 3 + 1] = f * (0.8 + 0.1 * p), n[o * 3 + 2] = f * (1 - 0.2 * p);
      }
      const s = new be();
      s.setAttribute("position", new xe(e, 3)), s.setAttribute("color", new xe(n, 3));
      const r = new ih({
        size: 1,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      }), a = new sh(s, r);
      return a.frustumCulled = false, a;
    }
  }
  function wv(i) {
    switch (i) {
      case X.DustCloud:
      case X.ProtostarCoalescence:
      case X.FusionIgnition:
        return 1;
      case X.MainSequence:
      case X.RedGiant:
        return 0.7;
      case X.Death:
        return 1;
      case X.Remnant:
        return 0.85;
      default:
        return 0.7;
    }
  }
  const ph = {
    [X.DustCloud]: "stage.dustCloud",
    [X.ProtostarCoalescence]: "stage.protostarCoalescence",
    [X.FusionIgnition]: "stage.fusionIgnition",
    [X.MainSequence]: "stage.mainSequence",
    [X.RedGiant]: "stage.redGiant",
    [X.Death]: "stage.death",
    [X.Remnant]: "stage.remnant"
  }, Ua = "star", mh = "none", rc = [
    {
      value: Ua,
      labelMessageId: "hud.focus.star"
    },
    {
      value: mh,
      labelMessageId: "hud.focus.none"
    }
  ];
  class Cv {
    i18n;
    locale;
    root;
    pauseButton;
    rewindButton = null;
    rewinding = false;
    labelsInput = null;
    orbitsInput = null;
    paceInput;
    focusSelect;
    stageLabel;
    bodyCountLabel;
    elapsedLabel;
    speedLabel;
    translatables = /* @__PURE__ */ new Map();
    paused = false;
    stage = X.DustCloud;
    bodyCount = 0;
    elapsedYears = 0;
    speedYearsPerSecond = 0;
    focusOptions = [
      ...rc
    ];
    constructor(t) {
      this.i18n = t.i18n ?? Yn, this.locale = t.locale, this.root = document.createElement("div"), this.root.className = "hud", this.stageLabel = document.createElement("div"), this.stageLabel.className = "hud-stage", this.bodyCountLabel = document.createElement("div"), this.bodyCountLabel.className = "hud-body-count", this.elapsedLabel = document.createElement("div"), this.elapsedLabel.className = "hud-elapsed", this.root.append(this.stageLabel, this.bodyCountLabel, this.elapsedLabel);
      const e = this.field("hud.timeScale");
      this.paceInput = document.createElement("input"), this.paceInput.type = "range", this.paceInput.min = "0", this.paceInput.max = "1", this.paceInput.step = "0.01", this.paceInput.value = String(t.initialPace ?? 0.5), this.paceInput.addEventListener("input", () => {
        t.onPaceChange(Number(this.paceInput.value));
      }), e.appendChild(this.paceInput), this.speedLabel = document.createElement("span"), this.speedLabel.className = "hud-speed", e.appendChild(this.speedLabel), this.pauseButton = this.button("hud.pause", t.onTogglePause);
      const n = t.onToggleRewind;
      n !== void 0 && (this.rewindButton = this.button("hud.rewind", () => {
        this.setRewinding(!this.rewinding), n(this.rewinding);
      })), this.button("hud.reset", t.onReset), this.button("hud.zoomIn", t.onZoomIn), this.button("hud.zoomOut", t.onZoomOut);
      const s = t.onToggleOrbits;
      s !== void 0 && (this.orbitsInput = this.checkbox("hud.orbits", t.initialOrbits ?? false, (o) => s(o)));
      const r = t.onToggleLabels;
      r !== void 0 && (this.labelsInput = this.checkbox("hud.labels", t.initialLabels ?? true, (o) => r(o)));
      const a = this.field("hud.focus");
      this.focusSelect = document.createElement("select"), this.focusSelect.className = "hud-focus", this.focusSelect.addEventListener("change", () => {
        t.onFocusChange(this.focusSelect.value);
      }), a.appendChild(this.focusSelect), this.renderFocusOptions(), this.applyTranslations(), t.container.appendChild(this.root);
    }
    get element() {
      return this.root;
    }
    get orbitsChecked() {
      return this.orbitsInput?.checked ?? false;
    }
    get labelsChecked() {
      return this.labelsInput?.checked ?? false;
    }
    setPaused(t) {
      this.paused = t, this.translatables.set(this.pauseButton, t ? "hud.resume" : "hud.pause"), this.pauseButton.textContent = this.t(t ? "hud.resume" : "hud.pause");
    }
    setRewinding(t) {
      this.rewinding = t;
      const e = this.rewindButton;
      if (e === null) return;
      const n = t ? "hud.rewindStop" : "hud.rewind";
      this.translatables.set(e, n), e.textContent = this.t(n), e.classList.toggle("hud-button--active", t);
    }
    get isRewinding() {
      return this.rewinding;
    }
    setStage(t) {
      this.stage = t, this.stageLabel.textContent = this.t("hud.stage", {
        stage: this.t(ph[t])
      });
    }
    setBodyCount(t) {
      this.bodyCount = t, this.bodyCountLabel.textContent = this.t("hud.bodyCount", {
        count: t
      });
    }
    setElapsedYears(t) {
      this.elapsedYears = t, this.elapsedLabel.textContent = this.t("hud.elapsed", {
        time: go(t, this.i18n, this.locale)
      });
    }
    setSpeedYearsPerSecond(t) {
      this.speedYearsPerSecond = t, this.speedLabel.textContent = this.t("hud.speed", {
        value: go(t, this.i18n, this.locale)
      });
    }
    setFocusOptions(t) {
      this.focusOptions = [
        ...rc,
        ...t
      ], this.renderFocusOptions();
    }
    setFocusValue(t) {
      this.focusOptions.some((e) => e.value === t) && (this.focusSelect.value = t);
    }
    setLocale(t) {
      this.locale = t, this.applyTranslations();
    }
    renderFocusOptions() {
      const t = this.focusSelect.value;
      this.focusSelect.replaceChildren();
      for (const e of this.focusOptions) {
        const n = document.createElement("option");
        n.value = e.value, n.textContent = this.t(e.labelMessageId, e.params), this.focusSelect.appendChild(n);
      }
      this.focusOptions.some((e) => e.value === t) && (this.focusSelect.value = t);
    }
    applyTranslations() {
      for (const [t, e] of this.translatables) t.textContent = this.t(e);
      this.setStage(this.stage), this.setBodyCount(this.bodyCount), this.setElapsedYears(this.elapsedYears), this.setSpeedYearsPerSecond(this.speedYearsPerSecond), this.renderFocusOptions();
    }
    t(t, e) {
      return this.i18n.translate(this.locale, t, e ?? {});
    }
    field(t) {
      const e = document.createElement("label");
      e.className = "hud-field";
      const n = document.createElement("span");
      return n.className = "hud-field__label", this.translatables.set(n, t), e.appendChild(n), this.root.appendChild(e), e;
    }
    checkbox(t, e, n) {
      const s = document.createElement("label");
      s.className = "hud-field hud-toggle";
      const r = document.createElement("input");
      r.type = "checkbox", r.className = "hud-toggle__input", r.checked = e, r.addEventListener("change", () => n(r.checked));
      const a = document.createElement("span");
      return a.className = "hud-field__label", this.translatables.set(a, t), s.append(r, a), this.root.appendChild(s), r;
    }
    button(t, e) {
      const n = document.createElement("button");
      return n.type = "button", this.translatables.set(n, t), n.addEventListener("click", e), this.root.appendChild(n), n;
    }
    get isPaused() {
      return this.paused;
    }
    destroy() {
      this.root.remove();
    }
  }
  const Rv = (() => {
    const i = {};
    for (const t of Object.keys(vo)) {
      const e = Number(t), n = vo[e];
      n !== void 0 && (i[n] = e);
    }
    return i;
  })(), ac = {
    [he.WhiteDwarf]: "remnant.whiteDwarf",
    [he.NeutronStar]: "remnant.neutronStar",
    [he.Pulsar]: "remnant.pulsar"
  }, $s = {
    [wt.Protoplanet]: "body.protoplanet",
    [wt.Planet]: "body.planet",
    [wt.Comet]: "body.comet",
    [wt.Asteroid]: "body.asteroid"
  };
  function Pv(i, t, e) {
    const n = {}, s = i.data;
    if (!s) return n;
    const r = s.remnant;
    typeof r == "number" && r in ac && (n.remnant = t.translate(e, ac[r]));
    const a = s.bodyType;
    return typeof a == "number" && a in $s && (n.body = t.translate(e, $s[a])), typeof s.bodyId == "number" && (n.id = s.bodyId), n;
  }
  class Dv {
    i18n;
    locale;
    enabled;
    maxVisible;
    root;
    constructor(t) {
      this.i18n = t.i18n ?? Yn, this.locale = t.locale, this.enabled = t.enabled, this.maxVisible = t.maxVisible ?? 6, this.root = document.createElement("div"), this.root.className = "event-annotations", this.root.setAttribute("aria-live", "polite"), t.container.appendChild(this.root);
    }
    get element() {
      return this.root;
    }
    resolve(t) {
      return this.enabled ? this.i18n.translate(this.locale, t.messageId, Pv(t, this.i18n, this.locale)) : null;
    }
    show(t) {
      const e = this.resolve(t);
      if (e === null) return null;
      const n = document.createElement("div");
      n.className = "event-annotation";
      const s = Rv[t.type];
      if (s !== void 0) {
        n.classList.add("event-annotation--stage");
        const r = document.createElement("span");
        r.className = "event-annotation__stage", r.textContent = this.i18n.translate(this.locale, ph[s]);
        const a = document.createElement("span");
        a.className = "event-annotation__text", a.textContent = e, n.append(r, a);
      } else n.textContent = e;
      return this.root.appendChild(n), this.trim(), n;
    }
    trim() {
      for (; this.root.childElementCount > this.maxVisible; ) {
        const t = Array.from(this.root.children);
        (t.find((n) => !n.classList.contains("event-annotation--stage")) ?? t[0])?.remove();
      }
    }
    setEnabled(t) {
      this.enabled = t, t || this.clear();
    }
    get isEnabled() {
      return this.enabled;
    }
    setLocale(t) {
      this.locale = t;
    }
    clear() {
      this.root.replaceChildren();
    }
    destroy() {
      this.root.remove();
    }
  }
  class Iv {
    i18n;
    locale;
    root;
    headingEl;
    closeButton;
    titleEl;
    descEl;
    noteEl;
    current = null;
    constructor(t) {
      this.i18n = t.i18n ?? Yn, this.locale = t.locale, this.root = document.createElement("div"), this.root.className = "body-info", this.root.hidden = true;
      const e = document.createElement("div");
      e.className = "body-info__header", this.headingEl = document.createElement("span"), this.headingEl.className = "body-info__heading", this.closeButton = document.createElement("button"), this.closeButton.type = "button", this.closeButton.className = "body-info__close", this.closeButton.setAttribute("aria-label", this.t("info.close")), this.closeButton.textContent = "\xD7", this.closeButton.addEventListener("click", () => this.hide()), e.append(this.headingEl, this.closeButton), this.titleEl = document.createElement("h3"), this.titleEl.className = "body-info__title", this.descEl = document.createElement("p"), this.descEl.className = "body-info__desc", this.noteEl = document.createElement("p"), this.noteEl.className = "body-info__note", this.root.append(e, this.titleEl, this.descEl, this.noteEl), t.container.appendChild(this.root), this.applyStaticLabels();
    }
    get element() {
      return this.root;
    }
    get isVisible() {
      return !this.root.hidden;
    }
    show(t) {
      this.current = t, this.render(), this.root.hidden = false;
    }
    hide() {
      this.root.hidden = true;
    }
    setLocale(t) {
      this.locale = t, this.applyStaticLabels(), this.render();
    }
    destroy() {
      this.root.remove();
    }
    render() {
      this.current !== null && (this.titleEl.textContent = this.t(this.current.titleId), this.descEl.textContent = this.t(this.current.descId), this.current.noteId ? (this.noteEl.textContent = this.t(this.current.noteId), this.noteEl.hidden = false) : (this.noteEl.textContent = "", this.noteEl.hidden = true));
    }
    applyStaticLabels() {
      this.headingEl.textContent = this.t("info.heading"), this.closeButton.setAttribute("aria-label", this.t("info.close"));
    }
    t(t) {
      return this.i18n.translate(this.locale, t);
    }
  }
  class Lv {
    root;
    onDocumentPointerDown;
    onKeyDown;
    constructor(t) {
      this.root = document.createElement("div"), this.root.className = "context-menu", this.root.hidden = true, this.root.style.pointerEvents = "auto", t.appendChild(this.root), this.onDocumentPointerDown = (e) => {
        this.root.contains(e.target) || this.close();
      }, this.onKeyDown = (e) => {
        e.key === "Escape" && this.close();
      };
    }
    get element() {
      return this.root;
    }
    get isOpen() {
      return !this.root.hidden;
    }
    open(t, e, n) {
      this.root.replaceChildren();
      for (const s of n) {
        const r = document.createElement("button");
        r.type = "button", r.className = "context-menu__item", r.textContent = s.label, r.addEventListener("click", () => {
          this.close(), s.onSelect();
        }), this.root.appendChild(r);
      }
      this.root.style.left = `${t}px`, this.root.style.top = `${e}px`, this.root.hidden = false, document.addEventListener("pointerdown", this.onDocumentPointerDown, true), document.addEventListener("keydown", this.onKeyDown);
    }
    close() {
      this.root.hidden || (this.root.hidden = true, document.removeEventListener("pointerdown", this.onDocumentPointerDown, true), document.removeEventListener("keydown", this.onKeyDown));
    }
    destroy() {
      this.close(), this.root.remove();
    }
  }
  const Uv = 1, Nv = 138e8 * 365.25 * 24 * 3600, Fv = 60;
  function Na(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  function Ov(i, t, e, n) {
    const s = Na(i, 0, 1), r = e / n;
    return t <= 0 ? r * s : t * Math.pow(r / t, s);
  }
  class Bv {
    paceValue;
    pausedValue = false;
    simTimeValue = 0;
    nearRealRate;
    lifecycleSimSeconds;
    fullCycleRealSeconds;
    constructor(t = {}) {
      this.nearRealRate = t.nearRealRate ?? Uv, this.lifecycleSimSeconds = t.lifecycleSimSeconds ?? Nv, this.fullCycleRealSeconds = t.fullCycleRealSeconds ?? Fv, this.paceValue = Na(t.pace ?? 0.5, 0, 1);
    }
    get pace() {
      return this.paceValue;
    }
    setPace(t) {
      this.paceValue = Na(t, 0, 1);
    }
    get paused() {
      return this.pausedValue;
    }
    pause() {
      this.pausedValue = true;
    }
    resume() {
      this.pausedValue = false;
    }
    setPaused(t) {
      this.pausedValue = t;
    }
    get simTime() {
      return this.simTimeValue;
    }
    simSecondsPerRealSecond() {
      return this.pausedValue ? 0 : this.currentRate();
    }
    currentRate() {
      return Ov(this.paceValue, this.nearRealRate, this.lifecycleSimSeconds, this.fullCycleRealSeconds);
    }
    advance(t) {
      if (this.pausedValue || !Number.isFinite(t) || t <= 0) return 0;
      const e = t * this.simSecondsPerRealSecond();
      return this.simTimeValue += e, e;
    }
    reset() {
      this.simTimeValue = 0;
    }
  }
  function oc(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  class zv {
    constructor(t) {
      this.capacity = t;
    }
    frames = [];
    cursorValue = 0;
    get size() {
      return this.frames.length;
    }
    get cursor() {
      return this.cursorValue;
    }
    get isLive() {
      return this.frames.length === 0 || this.cursorValue >= this.frames.length - 1 - 1e-9;
    }
    get atStart() {
      return this.frames.length > 0 && this.cursorValue <= 1e-9;
    }
    record(t) {
      this.frames.push(t), this.frames.length > this.capacity && this.frames.shift(), this.cursorValue = this.frames.length - 1;
    }
    seek(t) {
      return this.frames.length === 0 ? null : (this.cursorValue = oc(this.cursorValue + t, 0, this.frames.length - 1), this.currentFrame());
    }
    currentFrame() {
      if (this.frames.length === 0) return null;
      const t = Math.round(oc(this.cursorValue, 0, this.frames.length - 1));
      return this.frames[t] ?? null;
    }
    clear() {
      this.frames = [], this.cursorValue = 0;
    }
  }
  const gh = 4e3, _h = 0.2, kv = 240, lc = 4 / _h;
  class Hv {
    clock;
    config;
    kernel;
    particleCount;
    remnantType;
    stage = X.DustCloud;
    progress = 0;
    elapsed = 0;
    history = new zv(kv);
    rewinding = false;
    recordAccumulator = 0;
    constructor(t, e, n = {}) {
      this.config = t, this.kernel = e, this.particleCount = n.particleCount ?? gh, this.clock = n.clock ?? new Bv({
        pace: t.pace,
        ...n.clockOptions
      });
      const s = n.fateModel ?? fc;
      this.remnantType = s.determineFate(t.mass, t.composition).remnant, this.kernel.init({
        config: t,
        particleCount: this.particleCount
      });
    }
    get currentStage() {
      return this.stage;
    }
    get elapsedSimSeconds() {
      return this.elapsed;
    }
    tick(t) {
      const e = Number.isFinite(t) && t > 0 ? t : 0;
      if (this.rewinding) {
        const c = this.replay(-lc * e);
        if (c !== null) return c;
      } else if (!this.history.isLive) {
        const c = this.replay(lc * e);
        if (c !== null) return c;
      }
      const n = this.clock.advance(t), { events: s, stage: r, stageProgress: a, elapsedSimSeconds: o } = this.kernel.step(n);
      this.stage = r, this.progress = a, this.elapsed = o;
      const l = this.buildState(r);
      return this.maybeRecord(e, l), {
        state: l,
        events: s,
        elapsed: this.elapsed,
        fromHistory: false
      };
    }
    replay(t) {
      const e = this.history.seek(t);
      return e === null ? null : (this.stage = e.state.stage, this.progress = e.state.stageProgress, this.elapsed = e.elapsed, {
        state: e.state,
        events: [],
        elapsed: e.elapsed,
        fromHistory: true
      });
    }
    maybeRecord(t, e) {
      this.recordAccumulator += t, (this.history.size === 0 || this.recordAccumulator >= _h) && (this.recordAccumulator = 0, this.history.record({
        state: Gv(e),
        elapsed: this.elapsed
      }));
    }
    setRewinding(t) {
      this.rewinding = t;
    }
    get isRewinding() {
      return this.rewinding;
    }
    setPace(t) {
      this.clock.setPace(t);
    }
    togglePause() {
      const t = !this.clock.paused;
      return this.clock.setPaused(t), t;
    }
    get paused() {
      return this.clock.paused;
    }
    reset() {
      this.kernel.init({
        config: this.config,
        particleCount: this.particleCount
      }), this.clock.reset(), this.stage = X.DustCloud, this.progress = 0, this.elapsed = 0, this.history.clear(), this.rewinding = false, this.recordAccumulator = 0;
    }
    dispose() {
      this.kernel.dispose();
    }
    buildState(t) {
      const e = this.kernel.getParticleBuffer(), n = this.kernel.getBodyBuffer();
      return {
        particles: e,
        particleCount: Math.floor(e.length / xi),
        bodies: n,
        bodyCount: Math.floor(n.length / Ke),
        stage: t,
        stageProgress: this.progress,
        mass: this.config.mass,
        composition: this.config.composition,
        mu: vc(this.config.mass),
        remnant: t === X.Remnant ? this.remnantType : null
      };
    }
  }
  function Gv(i) {
    return {
      ...i,
      particles: i.particles.slice(0, i.particleCount * xi),
      bodies: i.bodies.slice(0, i.bodyCount * Ke),
      composition: {
        ...i.composition
      }
    };
  }
  const Vv = 6, zs = "body:";
  class Wv {
    container;
    config;
    locale;
    onExit;
    i18n;
    canvasHost;
    overlay;
    scene = null;
    runner = null;
    hud = null;
    annotations = null;
    infoPanel = null;
    contextMenu = null;
    focusSignature = "";
    disposed = false;
    lastStage = null;
    lastRemnant = null;
    pointerDownX = 0;
    pointerDownY = 0;
    onPointerDown = (t) => {
      this.pointerDownX = t.clientX, this.pointerDownY = t.clientY;
    };
    onPointerUp = (t) => this.handlePointerUp(t);
    onContextMenu = (t) => this.handleContextMenu(t);
    constructor(t) {
      this.container = t.container, this.config = t.config, this.locale = t.config.locale, this.onExit = t.onExit, this.i18n = t.i18n ?? Yn, this.container.classList.add("run-screen"), this.container.style.position = "relative", this.container.style.width = "100vw", this.container.style.height = "100vh", this.container.style.overflow = "hidden", this.canvasHost = document.createElement("div"), this.canvasHost.className = "run-canvas", this.canvasHost.style.position = "absolute", this.canvasHost.style.inset = "0", this.overlay = document.createElement("div"), this.overlay.className = "run-overlay", this.overlay.style.position = "absolute", this.overlay.style.inset = "0", this.overlay.style.pointerEvents = "none", this.container.append(this.canvasHost, this.overlay);
    }
    async start() {
      const t = gh, e = await Lu();
      if (this.disposed) {
        e.dispose();
        return;
      }
      this.runner = new Hv(this.config, e, {
        particleCount: t
      }), this.scene = new Av(this.canvasHost, {
        maxParticles: t,
        cometTailDistance: this.config.cloudExtent * 0.5,
        orbitMaxRadius: this.config.cloudExtent * 2,
        locale: this.locale,
        i18n: this.i18n
      }), this.hud = new Cv({
        container: this.overlay,
        i18n: this.i18n,
        locale: this.locale,
        initialPace: this.config.pace,
        onPaceChange: (n) => this.runner?.setPace(n),
        onTogglePause: () => this.handleTogglePause(),
        onToggleRewind: (n) => this.runner?.setRewinding(n),
        onReset: () => this.onExit(),
        onZoomIn: () => this.scene?.cameraController.zoomIn(),
        onZoomOut: () => this.scene?.cameraController.zoomOut(),
        onFocusChange: (n) => this.handleFocusChange(n),
        onToggleLabels: (n) => this.scene?.setLabelsEnabled(n),
        onToggleOrbits: (n) => this.scene?.setOrbitsEnabled(n),
        initialLabels: true,
        initialOrbits: false
      }), this.hud.element.style.pointerEvents = "auto", this.annotations = new Dv({
        container: this.overlay,
        i18n: this.i18n,
        locale: this.locale,
        enabled: this.config.showEventAnnotations
      }), this.infoPanel = new Iv({
        container: this.overlay,
        i18n: this.i18n,
        locale: this.locale
      }), this.infoPanel.element.style.pointerEvents = "auto", this.contextMenu = new Lv(this.overlay), this.scene.domElement.addEventListener("pointerdown", this.onPointerDown), this.scene.domElement.addEventListener("pointerup", this.onPointerUp), this.scene.domElement.addEventListener("contextmenu", this.onContextMenu), this.scene.start((n) => this.frame(n));
    }
    destroy() {
      this.disposed = true, this.scene !== null && (this.scene.domElement.removeEventListener("pointerdown", this.onPointerDown), this.scene.domElement.removeEventListener("pointerup", this.onPointerUp), this.scene.domElement.removeEventListener("contextmenu", this.onContextMenu)), this.scene?.dispose(), this.hud?.destroy(), this.annotations?.destroy(), this.infoPanel?.destroy(), this.contextMenu?.destroy(), this.runner?.dispose(), this.scene = null, this.hud = null, this.annotations = null, this.infoPanel = null, this.contextMenu = null, this.runner = null, this.container.replaceChildren(), this.container.classList.remove("run-screen");
    }
    frame(t) {
      const e = this.runner;
      if (e === null) return null;
      const { state: n, events: s, elapsed: r } = e.tick(t);
      this.lastStage = n.stage, this.lastRemnant = n.remnant;
      const a = this.annotations;
      if (a !== null) for (const l of s) a.show(l);
      const o = this.hud;
      return o !== null && (o.setStage(n.stage), o.setBodyCount(n.bodyCount), o.setElapsedYears(fo(r)), o.setSpeedYearsPerSecond(fo(e.clock.currentRate())), this.syncFocusOptions(n)), n;
    }
    handlePointerUp(t) {
      if (t.button !== 0 || Math.hypot(t.clientX - this.pointerDownX, t.clientY - this.pointerDownY) > Vv) return;
      const n = this.scene?.pickAtClient(t.clientX, t.clientY);
      if (!n) {
        this.infoPanel?.hide();
        return;
      }
      const s = n.kind === "star" ? {
        kind: "star",
        stage: this.lastStage ?? 0,
        remnant: this.lastRemnant
      } : {
        kind: "body",
        type: n.type,
        radius: n.radius,
        mass: n.mass,
        captured: n.captured
      };
      this.infoPanel?.show(r0(s));
    }
    handleContextMenu(t) {
      t.preventDefault();
      const e = this.scene?.pickAtClient(t.clientX, t.clientY);
      if (!e) {
        this.contextMenu?.close();
        return;
      }
      const n = e.kind === "star" ? Ua : `${zs}${e.id}`, s = e.kind === "star" ? this.i18n.translate(this.locale, "hud.focus.star") : this.i18n.translate(this.locale, "hud.focus.body", {
        body: this.i18n.translate(this.locale, $s[e.type] ?? "body.planet"),
        id: e.id
      }), r = this.i18n.translate(this.locale, "menu.centerOn", {
        target: s
      });
      this.contextMenu?.open(t.clientX, t.clientY, [
        {
          label: r,
          onSelect: () => this.applyFocus(n)
        }
      ]);
    }
    applyFocus(t) {
      this.hud?.setFocusValue(t), this.handleFocusChange(t);
    }
    handleTogglePause() {
      const t = this.runner?.togglePause() ?? false;
      this.hud?.setPaused(t);
    }
    handleFocusChange(t) {
      const e = this.scene;
      if (e !== null) {
        if (t === Ua) e.focusOnStar();
        else if (t === mh) e.cameraController.clearFollow();
        else if (t.startsWith(zs)) {
          const n = Number(t.slice(zs.length));
          Number.isFinite(n) && e.focusOnBody(n);
        }
      }
    }
    syncFocusOptions(t) {
      let e = "";
      const n = [];
      for (let s = 0; s < t.bodyCount; s += 1) {
        const r = s * Ke, a = t.bodies[r + Tt.id] ?? 0, o = t.bodies[r + Tt.type] ?? 0;
        e += `${a}:${o},`, n.push({
          value: `${zs}${a}`,
          labelMessageId: "hud.focus.body",
          params: {
            body: this.i18n.translate(this.locale, $s[o] ?? "body.planet"),
            id: a
          }
        });
      }
      e !== this.focusSignature && (this.focusSignature = e, this.hud?.setFocusOptions(n));
    }
  }
  class Xv {
    root;
    i18n;
    setupForm = null;
    runScreen = null;
    lastConfig = null;
    constructor(t, e = Yn) {
      this.root = t, this.i18n = e, this.showSetup();
    }
    showSetup() {
      this.teardownRun(), this.root.replaceChildren(), this.setupForm = new Dh({
        container: this.root,
        i18n: this.i18n,
        initialLocale: this.lastConfig?.locale ?? "en",
        initialPresetId: this.lastConfig?.presetId ?? Vr,
        onSubmit: (t) => {
          this.startRun(t);
        }
      });
    }
    async startRun(t) {
      this.lastConfig = t, this.teardownSetup(), this.root.replaceChildren();
      const e = new Wv({
        container: this.root,
        config: t,
        i18n: this.i18n,
        onExit: () => this.showSetup()
      });
      this.runScreen = e, await e.start();
    }
    teardownSetup() {
      this.setupForm?.destroy(), this.setupForm = null;
    }
    teardownRun() {
      this.runScreen?.destroy(), this.runScreen = null;
    }
  }
  const vh = document.getElementById("app");
  if (!vh) throw new Error("Root element #app not found");
  new Xv(vh);
})();
