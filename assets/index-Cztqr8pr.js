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
  function yc(i) {
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
  function No(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  const Qr = {
    baseEfficiency: 0.34,
    minEfficiency: 0.16,
    maxEfficiency: 0.42,
    solarMetallicity: 0.02,
    metallicityEfficiencyCoefficient: 1.2
  };
  function Ec(i, t = 0.02) {
    const e = Math.max(i, 1e-3), { baseEfficiency: n, minEfficiency: s, maxEfficiency: r } = Qr, { solarMetallicity: a, metallicityEfficiencyCoefficient: o } = Qr, l = Math.max(0, t) - a, c = No(1 - o * l, 0.7, 1.15), h = n * Math.pow(e, -0.08) * c;
    return No(h, s, r);
  }
  function bc(i, t = 0.02) {
    const e = Math.max(i, 0);
    return e * Ec(e, t);
  }
  function $h(i, t = 0.02) {
    const e = Math.max(i, 0);
    if (e === 0) return 0;
    let n = e / Qr.baseEfficiency;
    for (let s = 0; s < 24; s += 1) n = e / Ec(n, t);
    return n;
  }
  const ta = "sun-like";
  function bn(i, t) {
    return Math.round($h(i, t) * 10) / 10;
  }
  const Wi = {
    "brown-dwarf": {
      id: "brown-dwarf",
      nameMessageId: "preset.brownDwarf",
      composition: {
        hydrogen: 0.75,
        helium: 0.24,
        metals: 0.01
      },
      mass: bn(0.04, 0.01),
      cloudExtent: 20,
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
      mass: bn(0.5, 5e-3),
      cloudExtent: 35,
      pace: 0.5
    },
    "sun-like": {
      id: "sun-like",
      nameMessageId: "preset.sunLike",
      composition: {
        hydrogen: 0.74,
        helium: 0.24,
        metals: 0.02
      },
      mass: bn(1, 0.02),
      cloudExtent: 50,
      pace: 0.5
    },
    "neutron-star": {
      id: "neutron-star",
      nameMessageId: "preset.neutronStar",
      composition: {
        hydrogen: 0.73,
        helium: 0.25,
        metals: 0.02
      },
      mass: bn(10, 0.02),
      cloudExtent: 70,
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
      mass: bn(16, 0.02),
      cloudExtent: 90,
      pace: 0.5
    },
    pulsar: {
      id: "pulsar",
      nameMessageId: "preset.pulsar",
      composition: {
        hydrogen: 0.75,
        helium: 0.247,
        metals: 3e-3
      },
      mass: bn(19, 3e-3),
      cloudExtent: 100,
      pace: 0.5
    },
    "black-hole": {
      id: "black-hole",
      nameMessageId: "preset.blackHole",
      composition: {
        hydrogen: 0.755,
        helium: 0.244,
        metals: 1e-3
      },
      mass: bn(30, 1e-3),
      cloudExtent: 120,
      pace: 0.5
    },
    "direct-collapse": {
      id: "direct-collapse",
      nameMessageId: "preset.directCollapse",
      composition: {
        hydrogen: 0.757,
        helium: 0.2425,
        metals: 5e-4
      },
      mass: bn(45, 5e-4),
      cloudExtent: 150,
      pace: 0.5
    }
  }, Jh = {
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
    "body.brownDwarf": "brown dwarf",
    "body.star": "companion star",
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
    "event.companionIgnited": "A second star has ignited: a companion of {mass} now shares the system.",
    "hud.orbits": "Show orbits",
    "info.iceGiant.title": "Ice giant",
    "info.iceGiant.desc": "A world of water, ammonia and methane ices around a rocky core, like Uranus or Neptune. It formed beyond the snow line but too far out to capture much gas.",
    "preset.blackHole": "Black-hole progenitor",
    "remnant.blackHole": "black hole",
    "setup.outcome": "\u2192 forms a ~{star} M\u2609 star, which ends as a {remnant}. Most of the cloud never reaches the star.",
    "info.blackHole.title": "Black hole",
    "info.blackHole.desc": "The collapsed core of a very massive star, so dense that not even light escapes. What you see is the glowing accretion disc around its event horizon, not the object itself.",
    "hud.paused": "PAUSED",
    "hud.pauseHint": "Space",
    "event.supernova": "The core collapses and the star tears itself apart in a supernova \u2014 brighter, for a moment, than the whole galaxy.",
    "event.planetaryNebula": "The star gently sheds its outer layers into a glowing planetary nebula, laying its searing core bare.",
    "remnant.brownDwarf": "brown dwarf",
    "info.brownDwarf.title": "Brown dwarf",
    "info.brownDwarf.desc": 'A "failed star" \u2014 too light to ever fuse hydrogen. Electron degeneracy halted its collapse before the core reached 10 million K, so it burned its deuterium, then began cooling and fading forever.',
    "preset.brownDwarf": "Brown dwarf (failed star)",
    "preset.neutronStar": "Neutron star",
    "preset.pulsar": "Pulsar",
    "setup.outcome.substellar": "\u2192 forms a ~{jupiters} Jupiter-mass BROWN DWARF, not a star: below 0.08 M\u2609 the core never gets hot enough to fuse hydrogen, so it just cools forever.",
    "preset.directCollapse": "Direct collapse (star winks out)",
    "info.companionStar.title": "Companion star",
    "info.companionStar.desc": "A second star, born from the same collapsing cloud and bound to the first. Above 0.08 M\u2609 its core fuses hydrogen, so it shines with its own light and pulls on every planet in the system \u2014 most stars in the sky are in multiples like this.",
    "info.brownDwarfCompanion.title": "Brown-dwarf companion",
    "info.brownDwarfCompanion.desc": "A companion that formed too light to ever fuse hydrogen. It burns deuterium, glows a dull infrared red, and will simply cool for the rest of the system's life \u2014 a star that never quite started.",
    "info.note.noPlanets": "This cloud contains no heavier elements, so nothing solid can condense out of the disk: no rock, no ice, and therefore no planets at all."
  }, Qh = {
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
    "body.brownDwarf": "ruskea k\xE4\xE4pi\xF6",
    "body.star": "kumppanit\xE4hti",
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
    "event.companionIgnited": "Toinen t\xE4hti on syttynyt: {mass} kumppanit\xE4hti jakaa nyt j\xE4rjestelm\xE4n.",
    "hud.orbits": "N\xE4yt\xE4 radat",
    "info.iceGiant.title": "Jaattilaisplaneetta (jaa)",
    "info.iceGiant.desc": "Vedesta, ammoniakista ja metaanijaasta koostuva maailma kivisen ytimen ymparilla, kuten Uranus tai Neptunus. Se syntyi lumirajan takana mutta liian kaukana kaapatakseen paljon kaasua.",
    "preset.blackHole": "Mustan aukon esit\xE4hti",
    "remnant.blackHole": "musta aukko",
    "setup.outcome": "\u2192 muodostaa noin {star} M\u2609 t\xE4hden, josta tulee lopulta {remnant}. Suurin osa pilvest\xE4 ei koskaan p\xE4\xE4dy t\xE4hteen.",
    "info.blackHole.title": "Musta aukko",
    "info.blackHole.desc": "Hyvin massiivisen t\xE4hden luhistunut ydin, niin tihe\xE4 ettei edes valo p\xE4\xE4se pakoon. N\xE4kyviss\xE4 on tapahtumahorisonttia kiert\xE4v\xE4 hehkuva kertym\xE4kiekko, ei itse kohde.",
    "hud.paused": "PYS\xC4YTETTY",
    "hud.pauseHint": "V\xE4lily\xF6nti",
    "event.supernova": "Ydin luhistuu ja t\xE4hti repii itsens\xE4 kappaleiksi supernovassa \u2014 hetken ajan kirkkaampana kuin koko galaksi.",
    "event.planetaryNebula": "T\xE4hti ty\xF6nt\xE4\xE4 ulkokerroksensa hitaasti hehkuvaksi planetaariseksi sumuksi ja paljastaa polttavan ytimens\xE4.",
    "remnant.brownDwarf": "ruskea k\xE4\xE4pi\xF6",
    "info.brownDwarf.title": "Ruskea k\xE4\xE4pi\xF6",
    "info.brownDwarf.desc": '"Ep\xE4onnistunut t\xE4hti" \u2014 liian kevyt fuusioimaan vety\xE4. Elektronien degeneraatiopaine pys\xE4ytti romahduksen ennen kuin ydin saavutti 10 miljoonaa kelvini\xE4, joten se poltti deuteriuminsa ja alkoi sitten j\xE4\xE4hty\xE4 ja himmet\xE4 ikuisesti.',
    "preset.brownDwarf": "Ruskea k\xE4\xE4pi\xF6 (ep\xE4onnistunut t\xE4hti)",
    "preset.neutronStar": "Neutronit\xE4hti",
    "preset.pulsar": "Pulsari",
    "setup.outcome.substellar": "\u2192 muodostaa noin {jupiters} Jupiterin massaisen RUSKEAN K\xC4\xC4PI\xD6N, ei t\xE4hte\xE4: alle 0,08 M\u2609 ytimest\xE4 ei koskaan tule tarpeeksi kuumaa vedyn fuusioon, joten se vain j\xE4\xE4htyy ikuisesti.",
    "preset.directCollapse": "Suora romahdus (t\xE4hti katoaa)",
    "info.companionStar.title": "Seuralaist\xE4hti",
    "info.companionStar.desc": "Toinen t\xE4hti, joka syntyi samasta romahtavasta pilvest\xE4 ja on sidottu ensimm\xE4iseen. Yli 0,08 M\u2609 massalla sen ydin fuusioi vety\xE4, joten se loistaa omalla valollaan ja vet\xE4\xE4 puoleensa j\xE4rjestelm\xE4n jokaista planeettaa \u2014 useimmat taivaan t\xE4hdet ovat t\xE4llaisia moninkertaisia j\xE4rjestelmi\xE4.",
    "info.brownDwarfCompanion.title": "Ruskea k\xE4\xE4pi\xF6seuralainen",
    "info.brownDwarfCompanion.desc": "Seuralainen, joka syntyi liian kevyen\xE4 fuusioimaan vety\xE4. Se polttaa deuteriumia, hehkuu tummanpunaisena infrapunassa ja vain j\xE4\xE4htyy j\xE4rjestelm\xE4n loppuun asti \u2014 t\xE4hti, joka ei koskaan k\xE4ynnistynyt.",
    "info.note.noPlanets": "T\xE4ss\xE4 pilvess\xE4 ei ole raskaampia alkuaineita, joten kiekosta ei tiivisty mit\xE4\xE4n kiinte\xE4\xE4: ei kive\xE4, ei j\xE4\xE4t\xE4 eik\xE4 siis lainkaan planeettoja."
  }, Tc = "en";
  class tu {
    constructor(t = Tc) {
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
      return s === void 0 ? e : wc(s, n, this.resolveFormatLocale(t, e));
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
  function wc(i, t, e) {
    let n = "", s = 0;
    for (; s < i.length; ) {
      const r = i[s];
      if (r === "{") {
        const a = Ac(i, s);
        if (a === -1) {
          n += i.slice(s);
          break;
        }
        n += eu(i.slice(s + 1, a), t, e), s = a + 1;
      } else n += r, s += 1;
    }
    return n;
  }
  function Ac(i, t) {
    let e = 0;
    for (let n = t; n < i.length; n += 1) {
      const s = i[n];
      if (s === "{") e += 1;
      else if (s === "}" && (e -= 1, e === 0)) return n;
    }
    return -1;
  }
  function eu(i, t, e) {
    const n = i.indexOf(",");
    if (n === -1) return Fo(i.trim(), t);
    const s = i.slice(0, n).trim(), r = i.indexOf(",", n + 1);
    return (r === -1 ? i.slice(n + 1) : i.slice(n + 1, r)).trim() === "plural" && r !== -1 ? nu(s, i.slice(r + 1), t, e) : Fo(s, t);
  }
  function Fo(i, t) {
    const e = t[i];
    return e === void 0 ? `{${i}}` : String(e);
  }
  function nu(i, t, e, n) {
    const s = e[i], r = typeof s == "number" ? s : Number(s), a = iu(t), o = a.get(`=${r}`), l = Number.isFinite(r) ? new Intl.PluralRules(n).select(r) : "other", h = (o ?? a.get(l) ?? a.get("other") ?? "").replace(/#/g, String(r));
    return wc(h, e, n);
  }
  function iu(i) {
    const t = /* @__PURE__ */ new Map();
    let e = 0;
    for (; e < i.length; ) {
      for (; e < i.length && /\s/.test(i[e]); ) e += 1;
      if (e >= i.length) break;
      const n = i.indexOf("{", e);
      if (n === -1) break;
      const s = i.slice(e, n).trim(), r = Ac(i, n);
      if (r === -1) break;
      s && t.set(s, i.slice(n + 1, r)), e = r + 1;
    }
    return t;
  }
  const Oo = {
    en: Jh,
    fi: Qh
  }, ti = new tu(Tc).register("en", Oo.en).register("fi", Oo.fi);
  var nt = ((i) => (i[i.DustCloud = 0] = "DustCloud", i[i.ProtostarCoalescence = 1] = "ProtostarCoalescence", i[i.FusionIgnition = 2] = "FusionIgnition", i[i.MainSequence = 3] = "MainSequence", i[i.RedGiant = 4] = "RedGiant", i[i.Death = 5] = "Death", i[i.Remnant = 6] = "Remnant", i))(nt || {}), Pt = ((i) => (i[i.WhiteDwarf = 0] = "WhiteDwarf", i[i.NeutronStar = 1] = "NeutronStar", i[i.Pulsar = 2] = "Pulsar", i[i.BlackHole = 3] = "BlackHole", i[i.BrownDwarf = 4] = "BrownDwarf", i))(Pt || {});
  const $n = {
    hydrogenBurningMinMass: 0.08,
    deuteriumBurningMinMass: 0.013,
    supernovaMinMass: 8,
    pulsarMinMass: 12,
    blackHoleMinMass: 22,
    directCollapseMinMass: 40,
    solarMetallicity: 0.02,
    metalsMassLossCoefficient: 1.5
  };
  function su(i, t) {
    const { metalsMassLossCoefficient: e, solarMetallicity: n } = $n, s = t.metals - n, r = 1 - e * s;
    return Math.max(0, i * r);
  }
  function Cc(i) {
    return i < $n.hydrogenBurningMinMass;
  }
  function ar(i) {
    return Number.isFinite(i) && i >= $n.deuteriumBurningMinMass;
  }
  function Rc(i, t) {
    if (Cc(i)) return {
      supernova: false,
      remnant: 4
    };
    const e = su(i, t), { supernovaMinMass: n, pulsarMinMass: s, blackHoleMinMass: r, directCollapseMinMass: a } = $n;
    return e < n ? {
      supernova: false,
      remnant: 0
    } : e >= r ? {
      supernova: e < a,
      remnant: 3
    } : e >= s ? {
      supernova: true,
      remnant: 2
    } : {
      supernova: true,
      remnant: 1
    };
  }
  const ru = {
    determineFate: Rc
  }, au = 1, ou = 332946, lu = 1047.35, Za = 465047e-8, cu = 157e5, hu = 29.78;
  function $a(i) {
    return Math.max(0, i) / au;
  }
  function Ja(i) {
    return Math.max(0, i) * ou;
  }
  function uu(i) {
    return Math.max(0, i) * lu;
  }
  function Pc(i, t) {
    return !(t > 0) || !(i > 0) ? 0 : hu * Math.sqrt(i / t);
  }
  function ea(i) {
    const t = Math.max(i, 1e-3);
    return Math.pow(t, 0.8);
  }
  function du(i, t, e = null) {
    const n = Math.max(t, 1e-3);
    switch (i) {
      case nt.DustCloud:
      case nt.ProtostarCoalescence:
        return 4 * Math.pow(n, 0.5);
      case nt.FusionIgnition:
        return 1.5 * ea(n);
      case nt.RedGiant:
      case nt.Death:
        return Math.min(600, 100 * Math.pow(n, 0.5));
      case nt.Remnant:
        switch (e) {
          case Pt.BrownDwarf:
            return 0.1;
          case Pt.NeutronStar:
          case Pt.Pulsar:
            return 2e-5;
          case Pt.BlackHole:
            return 0;
          case Pt.WhiteDwarf:
          default:
            return 0.01;
        }
      case nt.MainSequence:
      default:
        return ea(n);
    }
  }
  function fu(i, t, e, n = 0) {
    if (!(e > 0) || !(i > 0) || !(t > 0)) return 0;
    const s = t * Za, r = Math.min(Math.max(n, 0), 0.99);
    return i * Math.sqrt(s / (2 * e)) * Math.pow(1 - r, 0.25);
  }
  function pu(i, t, e = null) {
    const n = Math.max(t, 1e-3), s = cu * Math.pow(n, 0.55);
    switch (i) {
      case nt.DustCloud:
        return 20;
      case nt.ProtostarCoalescence:
        return 3e6;
      case nt.FusionIgnition:
        return 1e7;
      case nt.MainSequence:
        return s;
      case nt.RedGiant:
        return Math.max(1e8, s * 6);
      case nt.Death:
        return Math.max(3e8, s * 20);
      case nt.Remnant:
        switch (e) {
          case Pt.BrownDwarf:
            return 3e6;
          case Pt.NeutronStar:
          case Pt.Pulsar:
            return 1e9;
          case Pt.BlackHole:
            return 1e7;
          case Pt.WhiteDwarf:
          default:
            return 1e7;
        }
      default:
        return s;
    }
  }
  const mu = 0.1, gu = 250, pr = 2e3, _u = {
    [Pt.WhiteDwarf]: "remnant.whiteDwarf",
    [Pt.NeutronStar]: "remnant.neutronStar",
    [Pt.Pulsar]: "remnant.pulsar",
    [Pt.BlackHole]: "remnant.blackHole",
    [Pt.BrownDwarf]: "remnant.brownDwarf"
  };
  function vu(i) {
    const t = {
      locale: i.locale,
      composition: yc(i.composition),
      mass: i.mass,
      cloudExtent: i.cloudExtent,
      pace: Math.min(1, Math.max(0, i.pace)),
      showEventAnnotations: i.showEventAnnotations,
      presetId: i.presetId
    };
    return Object.freeze(t);
  }
  const xu = [
    "en",
    "fi"
  ];
  class Mu {
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
    outcomeHint;
    translatables = /* @__PURE__ */ new Map();
    valueUpdaters = [];
    constructor(t) {
      this.i18n = t.i18n ?? ti, this.onSubmit = t.onSubmit, this.locale = t.initialLocale ?? "en", this.presetId = t.initialPresetId ?? ta;
      const e = Wi[this.presetId] ?? Wi[ta];
      if (!e) throw new Error("No presets are registered.");
      this.root = document.createElement("form"), this.root.className = "setup-form", this.appendHeading("setup.heading", "h1"), this.appendSubtitle("app.subtitle"), this.localeSelect = this.appendSelect("setup.language", xu.map((a) => ({
        value: a,
        labelId: `setup.language.${a}`
      })), this.locale), this.presetSelect = this.appendSelect("setup.preset", Object.values(Wi).map((a) => ({
        value: a.id,
        labelId: a.nameMessageId
      })), this.presetId);
      const n = (a) => `${a.toFixed(1)} M\u2609`, s = (a) => `${Math.round(a)} AU`, r = (a) => `${Math.round(a * 100)}%`;
      this.massInput = this.appendRange("setup.mass", mu, gu, 0.1, e.mass, {
        format: n,
        log: true
      }), this.outcomeHint = this.appendHint("setup.outcome"), this.extentInput = this.appendRange("setup.cloudExtent", 10, 250, 1, e.cloudExtent, {
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
      });
      for (const a of [
        this.massInput,
        this.metalsInput
      ]) a.input.addEventListener("input", () => this.updateOutcomeHint());
      this.showEventsInput = this.appendCheckbox("setup.showEvents", false), this.appendSubmit("setup.start"), this.localeSelect.addEventListener("change", () => {
        this.locale = this.localeSelect.value, this.applyTranslations();
      }), this.presetSelect.addEventListener("change", () => {
        this.applyPreset(this.presetSelect.value);
      }), this.root.addEventListener("submit", (a) => {
        a.preventDefault(), this.onSubmit(this.readConfig());
      }), this.applyTranslations(), t.container.appendChild(this.root);
    }
    updateOutcomeHint() {
      const t = this.massInput.get(), e = this.metalsInput.get(), n = bc(t, e), s = yc({
        hydrogen: Math.max(this.hydrogenInput.get(), 1e-9),
        helium: this.heliumInput.get(),
        metals: e
      }), r = Rc(n, s), a = Cc(n) ? "setup.outcome.substellar" : "setup.outcome";
      this.outcomeHint.textContent = this.i18n.translate(this.locale, a, {
        star: n >= 10 ? Math.round(n) : Number(n.toPrecision(2)),
        jupiters: Math.round(uu(n)),
        remnant: this.t(_u[r.remnant] ?? "remnant.whiteDwarf")
      });
    }
    get element() {
      return this.root;
    }
    readConfig() {
      return vu(this.readState());
    }
    readState() {
      return {
        locale: this.localeSelect.value,
        presetId: this.presetId,
        mass: this.massInput.get(),
        cloudExtent: this.extentInput.get(),
        pace: this.paceInput.get(),
        composition: {
          hydrogen: this.hydrogenInput.get(),
          helium: this.heliumInput.get(),
          metals: this.metalsInput.get()
        },
        showEventAnnotations: this.showEventsInput.checked
      };
    }
    applyPreset(t) {
      const e = Wi[t];
      if (e) {
        this.presetId = e.id, this.presetSelect.value = e.id, this.massInput.set(e.mass), this.extentInput.set(e.cloudExtent), this.hydrogenInput.set(e.composition.hydrogen), this.heliumInput.set(e.composition.helium), this.metalsInput.set(e.composition.metals), this.paceInput.set(e.pace);
        for (const n of this.valueUpdaters) n();
        this.updateOutcomeHint();
      }
    }
    applyTranslations() {
      for (const [t, e] of this.translatables) t.textContent = this.t(e);
      this.updateOutcomeHint();
      for (const t of this.localeSelect.options) t.textContent = this.t(`setup.language.${t.value}`);
      for (const t of this.presetSelect.options) {
        const e = Wi[t.value];
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
      return e.className = "setup-hint", this.translatables.set(e, t), this.root.appendChild(e), e;
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
      l.type = "range";
      const c = a?.log === true && e > 0, h = Math.log(e), d = Math.log(n) - h, f = (_) => c ? Math.exp(h + _ / pr * d) : _, p = (_) => {
        const m = Math.min(n, Math.max(e, _));
        return c ? (Math.log(m) - h) / d * pr : m;
      };
      l.min = String(c ? 0 : e), l.max = String(c ? pr : n), l.step = String(c ? 1 : s), l.value = String(p(r)), o.appendChild(l);
      const g = {
        input: l,
        get: () => {
          const _ = f(Number(l.value));
          return c ? Math.round(_ / s) * s : _;
        },
        set: (_) => {
          l.value = String(p(_));
        }
      };
      if (a?.format) {
        const _ = a.format, m = document.createElement("output");
        m.className = "setup-value";
        const u = () => {
          m.textContent = _(g.get());
        };
        l.addEventListener("input", u), this.valueUpdaters.push(u), u(), o.appendChild(m);
      }
      if (a?.minLabelId && a?.maxLabelId) {
        const _ = document.createElement("div");
        _.className = "setup-scale";
        const m = document.createElement("span"), u = document.createElement("span");
        this.translatables.set(m, a.minLabelId), this.translatables.set(u, a.maxLabelId), _.append(m, u), o.appendChild(_);
      }
      return g;
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
  const Qa = 7, Bn = {
    x: 0,
    y: 1,
    z: 2,
    r: 3,
    g: 4,
    b: 5,
    size: 6
  }, Nn = 12, Bt = {
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
  }, Su = 4;
  var kt = ((i) => (i[i.Protoplanet = 0] = "Protoplanet", i[i.Planet = 1] = "Planet", i[i.Comet = 2] = "Comet", i[i.Asteroid = 3] = "Asteroid", i[i.BrownDwarf = 4] = "BrownDwarf", i[i.Star = 5] = "Star", i))(kt || {});
  const yu = 365.25 * 24 * 3600;
  function Bo(i) {
    return Number.isFinite(i) ? i / yu : 0;
  }
  const Eu = [
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
  ], ko = /* @__PURE__ */ new Map();
  function zo(i, t) {
    const e = `${i}:${t}`;
    let n = ko.get(e);
    return n || (n = new Intl.NumberFormat(i, {
      maximumFractionDigits: t
    }), ko.set(e, n)), n;
  }
  function Ho(i, t, e) {
    const n = Number.isFinite(i) && i > 0 ? i : 0, s = Eu.find((a) => n >= a.threshold);
    if (s) {
      const a = n / s.threshold, o = zo(e, a < 100 ? 1 : 0).format(a);
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
      number: zo(e, 0).format(r),
      unit: t.translate(e, "time.year", {
        count: r
      })
    });
  }
  var Le = ((i) => (i[i.CollapseOnset = 0] = "CollapseOnset", i[i.ProtostarFormed = 1] = "ProtostarFormed", i[i.FusionIgnition = 2] = "FusionIgnition", i[i.PlanetFormed = 3] = "PlanetFormed", i[i.RedGiantOnset = 4] = "RedGiantOnset", i[i.DeathEvent = 5] = "DeathEvent", i[i.RemnantFormed = 6] = "RemnantFormed", i[i.BodyCaptured = 7] = "BodyCaptured", i[i.BodyEjected = 8] = "BodyEjected", i[i.BodyConsumed = 9] = "BodyConsumed", i[i.CompanionIgnited = 10] = "CompanionIgnited", i))(Le || {});
  const bu = {
    0: "event.collapseOnset",
    1: "event.protostarFormed",
    2: "event.fusionIgnition",
    3: "event.planetFormed",
    4: "event.redGiantOnset",
    5: "event.deathEvent",
    6: "event.remnantFormed",
    7: "event.bodyCaptured",
    8: "event.bodyEjected",
    9: "event.bodyConsumed",
    10: "event.companionIgnited"
  };
  function Tu(i) {
    return bu[i];
  }
  function Go(i, t, e) {
    const n = {
      type: i,
      simTime: t,
      messageId: Tu(i)
    };
    return e !== void 0 && (n.data = e), n;
  }
  class wu {
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
        elapsedSimSeconds: e.elapsed_sim_seconds(),
        starMassSolar: e.star_mass_solar()
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
    getAttractorBuffer() {
      const t = this.requireHandle();
      return new Float32Array(this.buffer(), t.attractor_ptr(), t.attractor_len());
    }
    orbitalMu() {
      return this.requireHandle().orbital_mu();
    }
    attractorCount() {
      return this.requireHandle().attractor_count();
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
        const o = a * n, l = s[o], c = s[o + 1] ?? 0, h = s[o + 2] ?? 0, d = s[o + 3] ?? 0, f = Au(l, h, d);
        r.push(f === void 0 ? Go(l, c) : Go(l, c, f));
      }
      return r;
    }
  }
  function Au(i, t, e) {
    switch (i) {
      case Le.DeathEvent:
        return {
          supernova: t === 1
        };
      case Le.RemnantFormed:
        return {
          remnant: t,
          supernova: e === 1
        };
      case Le.BodyCaptured:
      case Le.BodyEjected:
      case Le.BodyConsumed:
        return {
          bodyId: t,
          bodyType: e
        };
      case Le.CompanionIgnited:
        return {
          bodyId: t,
          massSolar: e
        };
      default:
        return;
    }
  }
  function Cu(i) {
    const t = typeof document < "u" ? document.baseURI : void 0;
    return t !== void 0 ? new URL("wasm/pkg/star_kernel.js", t).href : new URL("" + new URL("star_kernel-TCvlYJsQ.js", import.meta.url).href, import.meta.url).href;
  }
  async function Ru(i) {
    const e = await import(Cu()).then(async (m) => {
      await m.__tla;
      return m;
    });
    return await e.default(i), e;
  }
  async function Pu() {
    if (!Du()) throw new Error("WebAssembly is not available in this runtime; the simulation kernel cannot start.");
    const i = await Ru();
    return new wu(i);
  }
  function Du() {
    return typeof WebAssembly == "object" && typeof WebAssembly.instantiate == "function" && typeof WebAssembly.Memory == "function";
  }
  function Dc(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  function Lu(i, t, e = 1.6) {
    const n = Math.max(i, 1e-5), s = Dc(t, 1, 179) * Math.PI / 180 / 2, r = Math.tan(s);
    return (r > 1e-6 ? n / r : n) * Math.max(e, 1);
  }
  function mr(i, t, e, n) {
    if (!Number.isFinite(n) || n <= 0) return i;
    const s = 1 - Math.exp(-Math.max(0, e) * n);
    return i + (t - i) * s;
  }
  function Iu(i, t, e, n) {
    return [
      mr(i[0], t[0], e, n),
      mr(i[1], t[1], e, n),
      mr(i[2], t[2], e, n)
    ];
  }
  function Uu(i, t = 1e-6, e = 0.02) {
    return !Number.isFinite(i) || i <= 0 ? e : Dc(i * 0.01, Math.min(t, e), e);
  }
  const Nu = 1.6, Lc = 5e3, Ic = Lc * 2;
  function Fu(i, t, e, n = Nu) {
    if (!Number.isFinite(e) || e <= 0) return i;
    const s = e * Math.max(n, 1), r = i[0] - t[0], a = i[1] - t[1], o = i[2] - t[2], l = Math.sqrt(r * r + a * a + o * o);
    if (l >= s) return i;
    if (l < 1e-12) return [
      t[0],
      t[1],
      t[2] + s
    ];
    const c = s / l;
    return [
      t[0] + r * c,
      t[1] + a * c,
      t[2] + o * c
    ];
  }
  function Ou(i, t, e, n, s) {
    const r = [
      i[0] + (t[0] - e[0]),
      i[1] + (t[1] - e[1]),
      i[2] + (t[2] - e[2])
    ];
    return Iu(r, t, n, s);
  }
  const to = "170", Ti = {
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2
  }, yi = {
    ROTATE: 0,
    PAN: 1,
    DOLLY_PAN: 2,
    DOLLY_ROTATE: 3
  }, Bu = 0, Vo = 1, ku = 2, Uc = 1, zu = 2, fn = 3, Fn = 0, Ue = 1, Ce = 2, _n = 0, wi = 1, Ve = 2, Wo = 3, Xo = 4, Hu = 5, qn = 100, Gu = 101, Vu = 102, Wu = 103, Xu = 104, Yu = 200, qu = 201, ju = 202, Ku = 203, na = 204, ia = 205, Zu = 206, $u = 207, Ju = 208, Qu = 209, td = 210, ed = 211, nd = 212, id = 213, sd = 214, sa = 0, ra = 1, aa = 2, Ri = 3, oa = 4, la = 5, ca = 6, ha = 7, Nc = 0, rd = 1, ad = 2, Un = 0, Fc = 1, Oc = 2, Bc = 3, eo = 4, od = 5, kc = 6, zc = 7, Hc = 300, Pi = 301, Di = 302, ua = 303, da = 304, or = 306, fa = 1e3, Kn = 1001, pa = 1002, ke = 1003, ld = 1004, ds = 1005, en = 1006, gr = 1007, Zn = 1008, Sn = 1009, Gc = 1010, Vc = 1011, ss = 1012, no = 1013, Jn = 1014, nn = 1015, vn = 1016, io = 1017, so = 1018, Li = 1020, Wc = 35902, Xc = 1021, Yc = 1022, $e = 1023, qc = 1024, jc = 1025, Ai = 1026, Ii = 1027, ro = 1028, ao = 1029, Kc = 1030, oo = 1031, lo = 1033, Vs = 33776, Ws = 33777, Xs = 33778, Ys = 33779, ma = 35840, ga = 35841, _a = 35842, va = 35843, xa = 36196, Ma = 37492, Sa = 37496, ya = 37808, Ea = 37809, ba = 37810, Ta = 37811, wa = 37812, Aa = 37813, Ca = 37814, Ra = 37815, Pa = 37816, Da = 37817, La = 37818, Ia = 37819, Ua = 37820, Na = 37821, qs = 36492, Fa = 36494, Oa = 36495, Zc = 36283, Ba = 36284, ka = 36285, za = 36286, cd = 3200, hd = 3201, $c = 0, ud = 1, In = "", Be = "srgb", Bi = "srgb-linear", lr = "linear", $t = "srgb", ai = 7680, Yo = 519, dd = 512, fd = 513, pd = 514, Jc = 515, md = 516, gd = 517, _d = 518, vd = 519, qo = 35044, Dn = 35048, jo = "300 es", mn = 2e3, Ks = 2001;
  class ei {
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
  const Ee = [
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
  let Ko = 1234567;
  const ns = Math.PI / 180, rs = 180 / Math.PI;
  function ki() {
    const i = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
    return (Ee[i & 255] + Ee[i >> 8 & 255] + Ee[i >> 16 & 255] + Ee[i >> 24 & 255] + "-" + Ee[t & 255] + Ee[t >> 8 & 255] + "-" + Ee[t >> 16 & 15 | 64] + Ee[t >> 24 & 255] + "-" + Ee[e & 63 | 128] + Ee[e >> 8 & 255] + "-" + Ee[e >> 16 & 255] + Ee[e >> 24 & 255] + Ee[n & 255] + Ee[n >> 8 & 255] + Ee[n >> 16 & 255] + Ee[n >> 24 & 255]).toLowerCase();
  }
  function Te(i, t, e) {
    return Math.max(t, Math.min(e, i));
  }
  function co(i, t) {
    return (i % t + t) % t;
  }
  function xd(i, t, e, n, s) {
    return n + (i - t) * (s - n) / (e - t);
  }
  function Md(i, t, e) {
    return i !== t ? (e - i) / (t - i) : 0;
  }
  function is(i, t, e) {
    return (1 - e) * i + e * t;
  }
  function Sd(i, t, e, n) {
    return is(i, t, 1 - Math.exp(-e * n));
  }
  function yd(i, t = 1) {
    return t - Math.abs(co(i, t * 2) - t);
  }
  function Ed(i, t, e) {
    return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * (3 - 2 * i));
  }
  function bd(i, t, e) {
    return i <= t ? 0 : i >= e ? 1 : (i = (i - t) / (e - t), i * i * i * (i * (i * 6 - 15) + 10));
  }
  function Td(i, t) {
    return i + Math.floor(Math.random() * (t - i + 1));
  }
  function wd(i, t) {
    return i + Math.random() * (t - i);
  }
  function Ad(i) {
    return i * (0.5 - Math.random());
  }
  function Cd(i) {
    i !== void 0 && (Ko = i);
    let t = Ko += 1831565813;
    return t = Math.imul(t ^ t >>> 15, t | 1), t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function Rd(i) {
    return i * ns;
  }
  function Pd(i) {
    return i * rs;
  }
  function Dd(i) {
    return (i & i - 1) === 0 && i !== 0;
  }
  function Ld(i) {
    return Math.pow(2, Math.ceil(Math.log(i) / Math.LN2));
  }
  function Id(i) {
    return Math.pow(2, Math.floor(Math.log(i) / Math.LN2));
  }
  function Ud(i, t, e, n, s) {
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
  function Si(i, t) {
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
  function we(i, t) {
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
  const Qc = {
    DEG2RAD: ns,
    RAD2DEG: rs,
    generateUUID: ki,
    clamp: Te,
    euclideanModulo: co,
    mapLinear: xd,
    inverseLerp: Md,
    lerp: is,
    damp: Sd,
    pingpong: yd,
    smoothstep: Ed,
    smootherstep: bd,
    randInt: Td,
    randFloat: wd,
    randFloatSpread: Ad,
    seededRandom: Cd,
    degToRad: Rd,
    radToDeg: Pd,
    isPowerOfTwo: Dd,
    ceilPowerOfTwo: Ld,
    floorPowerOfTwo: Id,
    setQuaternionFromProperEuler: Ud,
    normalize: we,
    denormalize: Si
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
      return Math.acos(Te(n, -1, 1));
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
  class It {
    constructor(t, e, n, s, r, a, o, l, c) {
      It.prototype.isMatrix3 = true, this.elements = [
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
      const n = t.elements, s = e.elements, r = this.elements, a = n[0], o = n[3], l = n[6], c = n[1], h = n[4], d = n[7], f = n[2], p = n[5], g = n[8], _ = s[0], m = s[3], u = s[6], E = s[1], b = s[4], S = s[7], N = s[2], w = s[5], A = s[8];
      return r[0] = a * _ + o * E + l * N, r[3] = a * m + o * b + l * w, r[6] = a * u + o * S + l * A, r[1] = c * _ + h * E + d * N, r[4] = c * m + h * b + d * w, r[7] = c * u + h * S + d * A, r[2] = f * _ + p * E + g * N, r[5] = f * m + p * b + g * w, r[8] = f * u + p * S + g * A, this;
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
      const _ = 1 / g;
      return t[0] = d * _, t[1] = (s * c - h * n) * _, t[2] = (o * n - s * a) * _, t[3] = f * _, t[4] = (h * e - s * l) * _, t[5] = (s * r - o * e) * _, t[6] = p * _, t[7] = (n * l - c * e) * _, t[8] = (a * e - n * r) * _, this;
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
      return this.premultiply(_r.makeScale(t, e)), this;
    }
    rotate(t) {
      return this.premultiply(_r.makeRotation(-t)), this;
    }
    translate(t, e) {
      return this.premultiply(_r.makeTranslation(t, e)), this;
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
  const _r = new It();
  function th(i) {
    for (let t = i.length - 1; t >= 0; --t) if (i[t] >= 65535) return true;
    return false;
  }
  function Zs(i) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", i);
  }
  function Nd() {
    const i = Zs("canvas");
    return i.style.display = "block", i;
  }
  const Zo = {};
  function ts(i) {
    i in Zo || (Zo[i] = true, console.warn(i));
  }
  function Fd(i, t, e) {
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
  function Od(i) {
    const t = i.elements;
    t[2] = 0.5 * t[2] + 0.5 * t[3], t[6] = 0.5 * t[6] + 0.5 * t[7], t[10] = 0.5 * t[10] + 0.5 * t[11], t[14] = 0.5 * t[14] + 0.5 * t[15];
  }
  function Bd(i) {
    const t = i.elements;
    t[11] === -1 ? (t[10] = -t[10] - 1, t[14] = -t[14]) : (t[10] = -t[10], t[14] = -t[14] + 1);
  }
  const Vt = {
    enabled: true,
    workingColorSpace: Bi,
    spaces: {},
    convert: function(i, t, e) {
      return this.enabled === false || t === e || !t || !e || (this.spaces[t].transfer === $t && (i.r = xn(i.r), i.g = xn(i.g), i.b = xn(i.b)), this.spaces[t].primaries !== this.spaces[e].primaries && (i.applyMatrix3(this.spaces[t].toXYZ), i.applyMatrix3(this.spaces[e].fromXYZ)), this.spaces[e].transfer === $t && (i.r = Ci(i.r), i.g = Ci(i.g), i.b = Ci(i.b))), i;
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
      return i === In ? lr : this.spaces[i].transfer;
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
  function xn(i) {
    return i < 0.04045 ? i * 0.0773993808 : Math.pow(i * 0.9478672986 + 0.0521327014, 2.4);
  }
  function Ci(i) {
    return i < 31308e-7 ? i * 12.92 : 1.055 * Math.pow(i, 0.41666) - 0.055;
  }
  const $o = [
    0.64,
    0.33,
    0.3,
    0.6,
    0.15,
    0.06
  ], Jo = [
    0.2126,
    0.7152,
    0.0722
  ], Qo = [
    0.3127,
    0.329
  ], tl = new It().set(0.4123908, 0.3575843, 0.1804808, 0.212639, 0.7151687, 0.0721923, 0.0193308, 0.1191948, 0.9505322), el = new It().set(3.2409699, -1.5373832, -0.4986108, -0.9692436, 1.8759675, 0.0415551, 0.0556301, -0.203977, 1.0569715);
  Vt.define({
    [Bi]: {
      primaries: $o,
      whitePoint: Qo,
      transfer: lr,
      toXYZ: tl,
      fromXYZ: el,
      luminanceCoefficients: Jo,
      workingColorSpaceConfig: {
        unpackColorSpace: Be
      },
      outputColorSpaceConfig: {
        drawingBufferColorSpace: Be
      }
    },
    [Be]: {
      primaries: $o,
      whitePoint: Qo,
      transfer: $t,
      toXYZ: tl,
      fromXYZ: el,
      luminanceCoefficients: Jo,
      outputColorSpaceConfig: {
        drawingBufferColorSpace: Be
      }
    }
  });
  let oi;
  class kd {
    static getDataURL(t) {
      if (/^data:/i.test(t.src) || typeof HTMLCanvasElement > "u") return t.src;
      let e;
      if (t instanceof HTMLCanvasElement) e = t;
      else {
        oi === void 0 && (oi = Zs("canvas")), oi.width = t.width, oi.height = t.height;
        const n = oi.getContext("2d");
        t instanceof ImageData ? n.putImageData(t, 0, 0) : n.drawImage(t, 0, 0, t.width, t.height), e = oi;
      }
      return e.width > 2048 || e.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", t), e.toDataURL("image/jpeg", 0.6)) : e.toDataURL("image/png");
    }
    static sRGBToLinear(t) {
      if (typeof HTMLImageElement < "u" && t instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && t instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && t instanceof ImageBitmap) {
        const e = Zs("canvas");
        e.width = t.width, e.height = t.height;
        const n = e.getContext("2d");
        n.drawImage(t, 0, 0, t.width, t.height);
        const s = n.getImageData(0, 0, t.width, t.height), r = s.data;
        for (let a = 0; a < r.length; a++) r[a] = xn(r[a] / 255) * 255;
        return n.putImageData(s, 0, 0), e;
      } else if (t.data) {
        const e = t.data.slice(0);
        for (let n = 0; n < e.length; n++) e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[n] = Math.floor(xn(e[n] / 255) * 255) : e[n] = xn(e[n]);
        return {
          data: e,
          width: t.width,
          height: t.height
        };
      } else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), t;
    }
  }
  let zd = 0;
  class eh {
    constructor(t = null) {
      this.isSource = true, Object.defineProperty(this, "id", {
        value: zd++
      }), this.uuid = ki(), this.data = t, this.dataReady = true, this.version = 0;
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
          for (let a = 0, o = s.length; a < o; a++) s[a].isDataTexture ? r.push(vr(s[a].image)) : r.push(vr(s[a]));
        } else r = vr(s);
        n.url = r;
      }
      return e || (t.images[this.uuid] = n), n;
    }
  }
  function vr(i) {
    return typeof HTMLImageElement < "u" && i instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && i instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && i instanceof ImageBitmap ? kd.getDataURL(i) : i.data ? {
      data: Array.from(i.data),
      width: i.width,
      height: i.height,
      type: i.data.constructor.name
    } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
  }
  let Hd = 0;
  class Re extends ei {
    constructor(t = Re.DEFAULT_IMAGE, e = Re.DEFAULT_MAPPING, n = Kn, s = Kn, r = en, a = Zn, o = $e, l = Sn, c = Re.DEFAULT_ANISOTROPY, h = In) {
      super(), this.isTexture = true, Object.defineProperty(this, "id", {
        value: Hd++
      }), this.uuid = ki(), this.name = "", this.source = new eh(t), this.mipmaps = [], this.mapping = e, this.channel = 0, this.wrapS = n, this.wrapT = s, this.magFilter = r, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new _t(0, 0), this.repeat = new _t(1, 1), this.center = new _t(0, 0), this.rotation = 0, this.matrixAutoUpdate = true, this.matrix = new It(), this.generateMipmaps = true, this.premultiplyAlpha = false, this.flipY = true, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = false, this.pmremVersion = 0;
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
      if (this.mapping !== Hc) return t;
      if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
        case fa:
          t.x = t.x - Math.floor(t.x);
          break;
        case Kn:
          t.x = t.x < 0 ? 0 : 1;
          break;
        case pa:
          Math.abs(Math.floor(t.x) % 2) === 1 ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
          break;
      }
      if (t.y < 0 || t.y > 1) switch (this.wrapT) {
        case fa:
          t.y = t.y - Math.floor(t.y);
          break;
        case Kn:
          t.y = t.y < 0 ? 0 : 1;
          break;
        case pa:
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
  Re.DEFAULT_IMAGE = null;
  Re.DEFAULT_MAPPING = Hc;
  Re.DEFAULT_ANISOTROPY = 1;
  class Qt {
    constructor(t = 0, e = 0, n = 0, s = 1) {
      Qt.prototype.isVector4 = true, this.x = t, this.y = e, this.z = n, this.w = s;
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
      const l = t.elements, c = l[0], h = l[4], d = l[8], f = l[1], p = l[5], g = l[9], _ = l[2], m = l[6], u = l[10];
      if (Math.abs(h - f) < 0.01 && Math.abs(d - _) < 0.01 && Math.abs(g - m) < 0.01) {
        if (Math.abs(h + f) < 0.1 && Math.abs(d + _) < 0.1 && Math.abs(g + m) < 0.1 && Math.abs(c + p + u - 3) < 0.1) return this.set(1, 0, 0, 0), this;
        e = Math.PI;
        const b = (c + 1) / 2, S = (p + 1) / 2, N = (u + 1) / 2, w = (h + f) / 4, A = (d + _) / 4, P = (g + m) / 4;
        return b > S && b > N ? b < 0.01 ? (n = 0, s = 0.707106781, r = 0.707106781) : (n = Math.sqrt(b), s = w / n, r = A / n) : S > N ? S < 0.01 ? (n = 0.707106781, s = 0, r = 0.707106781) : (s = Math.sqrt(S), n = w / s, r = P / s) : N < 0.01 ? (n = 0.707106781, s = 0.707106781, r = 0) : (r = Math.sqrt(N), n = A / r, s = P / r), this.set(n, s, r, e), this;
      }
      let E = Math.sqrt((m - g) * (m - g) + (d - _) * (d - _) + (f - h) * (f - h));
      return Math.abs(E) < 1e-3 && (E = 1), this.x = (m - g) / E, this.y = (d - _) / E, this.z = (f - h) / E, this.w = Math.acos((c + p + u - 1) / 2), this;
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
  class Gd extends ei {
    constructor(t = 1, e = 1, n = {}) {
      super(), this.isRenderTarget = true, this.width = t, this.height = e, this.depth = 1, this.scissor = new Qt(0, 0, t, e), this.scissorTest = false, this.viewport = new Qt(0, 0, t, e);
      const s = {
        width: t,
        height: e,
        depth: 1
      };
      n = Object.assign({
        generateMipmaps: false,
        internalFormat: null,
        minFilter: en,
        depthBuffer: true,
        stencilBuffer: false,
        resolveDepthBuffer: true,
        resolveStencilBuffer: true,
        depthTexture: null,
        samples: 0,
        count: 1
      }, n);
      const r = new Re(s, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
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
      return this.texture.source = new eh(e), this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, this.resolveDepthBuffer = t.resolveDepthBuffer, this.resolveStencilBuffer = t.resolveStencilBuffer, t.depthTexture !== null && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, this;
    }
    dispose() {
      this.dispatchEvent({
        type: "dispose"
      });
    }
  }
  class Je extends Gd {
    constructor(t = 1, e = 1, n = {}) {
      super(t, e, n), this.isWebGLRenderTarget = true;
    }
  }
  class nh extends Re {
    constructor(t = null, e = 1, n = 1, s = 1) {
      super(null), this.isDataArrayTexture = true, this.image = {
        data: t,
        width: e,
        height: n,
        depth: s
      }, this.magFilter = ke, this.minFilter = ke, this.wrapR = Kn, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
    }
    addLayerUpdate(t) {
      this.layerUpdates.add(t);
    }
    clearLayerUpdates() {
      this.layerUpdates.clear();
    }
  }
  class Vd extends Re {
    constructor(t = null, e = 1, n = 1, s = 1) {
      super(null), this.isData3DTexture = true, this.image = {
        data: t,
        width: e,
        height: n,
        depth: s
      }, this.magFilter = ke, this.minFilter = ke, this.wrapR = Kn, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
    }
  }
  class Qn {
    constructor(t = 0, e = 0, n = 0, s = 1) {
      this.isQuaternion = true, this._x = t, this._y = e, this._z = n, this._w = s;
    }
    static slerpFlat(t, e, n, s, r, a, o) {
      let l = n[s + 0], c = n[s + 1], h = n[s + 2], d = n[s + 3];
      const f = r[a + 0], p = r[a + 1], g = r[a + 2], _ = r[a + 3];
      if (o === 0) {
        t[e + 0] = l, t[e + 1] = c, t[e + 2] = h, t[e + 3] = d;
        return;
      }
      if (o === 1) {
        t[e + 0] = f, t[e + 1] = p, t[e + 2] = g, t[e + 3] = _;
        return;
      }
      if (d !== _ || l !== f || c !== p || h !== g) {
        let m = 1 - o;
        const u = l * f + c * p + h * g + d * _, E = u >= 0 ? 1 : -1, b = 1 - u * u;
        if (b > Number.EPSILON) {
          const N = Math.sqrt(b), w = Math.atan2(N, u * E);
          m = Math.sin(m * w) / N, o = Math.sin(o * w) / N;
        }
        const S = o * E;
        if (l = l * m + f * S, c = c * m + p * S, h = h * m + g * S, d = d * m + _ * S, m === 1 - o) {
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
      return 2 * Math.acos(Math.abs(Te(this.dot(t), -1, 1)));
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
  class C {
    constructor(t = 0, e = 0, n = 0) {
      C.prototype.isVector3 = true, this.x = t, this.y = e, this.z = n;
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
      return this.applyQuaternion(nl.setFromEuler(t));
    }
    applyAxisAngle(t, e) {
      return this.applyQuaternion(nl.setFromAxisAngle(t, e));
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
      return xr.copy(this).projectOnVector(t), this.sub(xr);
    }
    reflect(t) {
      return this.sub(xr.copy(t).multiplyScalar(2 * this.dot(t)));
    }
    angleTo(t) {
      const e = Math.sqrt(this.lengthSq() * t.lengthSq());
      if (e === 0) return Math.PI / 2;
      const n = this.dot(t) / e;
      return Math.acos(Te(n, -1, 1));
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
  const xr = new C(), nl = new Qn();
  class ni {
    constructor(t = new C(1 / 0, 1 / 0, 1 / 0), e = new C(-1 / 0, -1 / 0, -1 / 0)) {
      this.isBox3 = true, this.min = t, this.max = e;
    }
    set(t, e) {
      return this.min.copy(t), this.max.copy(e), this;
    }
    setFromArray(t) {
      this.makeEmpty();
      for (let e = 0, n = t.length; e < n; e += 3) this.expandByPoint(Ye.fromArray(t, e));
      return this;
    }
    setFromBufferAttribute(t) {
      this.makeEmpty();
      for (let e = 0, n = t.count; e < n; e++) this.expandByPoint(Ye.fromBufferAttribute(t, e));
      return this;
    }
    setFromPoints(t) {
      this.makeEmpty();
      for (let e = 0, n = t.length; e < n; e++) this.expandByPoint(t[e]);
      return this;
    }
    setFromCenterAndSize(t, e) {
      const n = Ye.copy(e).multiplyScalar(0.5);
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
        if (e === true && r !== void 0 && t.isInstancedMesh !== true) for (let a = 0, o = r.count; a < o; a++) t.isMesh === true ? t.getVertexPosition(a, Ye) : Ye.fromBufferAttribute(r, a), Ye.applyMatrix4(t.matrixWorld), this.expandByPoint(Ye);
        else t.boundingBox !== void 0 ? (t.boundingBox === null && t.computeBoundingBox(), fs.copy(t.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), fs.copy(n.boundingBox)), fs.applyMatrix4(t.matrixWorld), this.union(fs);
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
      return this.clampPoint(t.center, Ye), Ye.distanceToSquared(t.center) <= t.radius * t.radius;
    }
    intersectsPlane(t) {
      let e, n;
      return t.normal.x > 0 ? (e = t.normal.x * this.min.x, n = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, n = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, n += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, n += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, n += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, n += t.normal.z * this.min.z), e <= -t.constant && n >= -t.constant;
    }
    intersectsTriangle(t) {
      if (this.isEmpty()) return false;
      this.getCenter(Xi), ps.subVectors(this.max, Xi), li.subVectors(t.a, Xi), ci.subVectors(t.b, Xi), hi.subVectors(t.c, Xi), Tn.subVectors(ci, li), wn.subVectors(hi, ci), kn.subVectors(li, hi);
      let e = [
        0,
        -Tn.z,
        Tn.y,
        0,
        -wn.z,
        wn.y,
        0,
        -kn.z,
        kn.y,
        Tn.z,
        0,
        -Tn.x,
        wn.z,
        0,
        -wn.x,
        kn.z,
        0,
        -kn.x,
        -Tn.y,
        Tn.x,
        0,
        -wn.y,
        wn.x,
        0,
        -kn.y,
        kn.x,
        0
      ];
      return !Mr(e, li, ci, hi, ps) || (e = [
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ], !Mr(e, li, ci, hi, ps)) ? false : (ms.crossVectors(Tn, wn), e = [
        ms.x,
        ms.y,
        ms.z
      ], Mr(e, li, ci, hi, ps));
    }
    clampPoint(t, e) {
      return e.copy(t).clamp(this.min, this.max);
    }
    distanceToPoint(t) {
      return this.clampPoint(t, Ye).distanceTo(t);
    }
    getBoundingSphere(t) {
      return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = this.getSize(Ye).length() * 0.5), t;
    }
    intersect(t) {
      return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), this;
    }
    union(t) {
      return this.min.min(t.min), this.max.max(t.max), this;
    }
    applyMatrix4(t) {
      return this.isEmpty() ? this : (ln[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), ln[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), ln[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), ln[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), ln[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), ln[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), ln[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), ln[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(ln), this);
    }
    translate(t) {
      return this.min.add(t), this.max.add(t), this;
    }
    equals(t) {
      return t.min.equals(this.min) && t.max.equals(this.max);
    }
  }
  const ln = [
    new C(),
    new C(),
    new C(),
    new C(),
    new C(),
    new C(),
    new C(),
    new C()
  ], Ye = new C(), fs = new ni(), li = new C(), ci = new C(), hi = new C(), Tn = new C(), wn = new C(), kn = new C(), Xi = new C(), ps = new C(), ms = new C(), zn = new C();
  function Mr(i, t, e, n, s) {
    for (let r = 0, a = i.length - 3; r <= a; r += 3) {
      zn.fromArray(i, r);
      const o = s.x * Math.abs(zn.x) + s.y * Math.abs(zn.y) + s.z * Math.abs(zn.z), l = t.dot(zn), c = e.dot(zn), h = n.dot(zn);
      if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o) return false;
    }
    return true;
  }
  const Wd = new ni(), Yi = new C(), Sr = new C();
  class ii {
    constructor(t = new C(), e = -1) {
      this.isSphere = true, this.center = t, this.radius = e;
    }
    set(t, e) {
      return this.center.copy(t), this.radius = e, this;
    }
    setFromPoints(t, e) {
      const n = this.center;
      e !== void 0 ? n.copy(e) : Wd.setFromPoints(t).getCenter(n);
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
      Yi.subVectors(t, this.center);
      const e = Yi.lengthSq();
      if (e > this.radius * this.radius) {
        const n = Math.sqrt(e), s = (n - this.radius) * 0.5;
        this.center.addScaledVector(Yi, s / n), this.radius += s;
      }
      return this;
    }
    union(t) {
      return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (this.center.equals(t.center) === true ? this.radius = Math.max(this.radius, t.radius) : (Sr.subVectors(t.center, this.center).setLength(t.radius), this.expandByPoint(Yi.copy(t.center).add(Sr)), this.expandByPoint(Yi.copy(t.center).sub(Sr))), this);
    }
    equals(t) {
      return t.center.equals(this.center) && t.radius === this.radius;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  const cn = new C(), yr = new C(), gs = new C(), An = new C(), Er = new C(), _s = new C(), br = new C();
  class ls {
    constructor(t = new C(), e = new C(0, 0, -1)) {
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
      return this.origin.copy(this.at(t, cn)), this;
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
      const e = cn.subVectors(t, this.origin).dot(this.direction);
      return e < 0 ? this.origin.distanceToSquared(t) : (cn.copy(this.origin).addScaledVector(this.direction, e), cn.distanceToSquared(t));
    }
    distanceSqToSegment(t, e, n, s) {
      yr.copy(t).add(e).multiplyScalar(0.5), gs.copy(e).sub(t).normalize(), An.copy(this.origin).sub(yr);
      const r = t.distanceTo(e) * 0.5, a = -this.direction.dot(gs), o = An.dot(this.direction), l = -An.dot(gs), c = An.lengthSq(), h = Math.abs(1 - a * a);
      let d, f, p, g;
      if (h > 0) if (d = a * l - o, f = a * o - l, g = r * h, d >= 0) if (f >= -g) if (f <= g) {
        const _ = 1 / h;
        d *= _, f *= _, p = d * (d + a * f + 2 * o) + f * (a * d + f + 2 * l) + c;
      } else f = r, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
      else f = -r, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
      else f <= -g ? (d = Math.max(0, -(-a * r + o)), f = d > 0 ? -r : Math.min(Math.max(-r, -l), r), p = -d * d + f * (f + 2 * l) + c) : f <= g ? (d = 0, f = Math.min(Math.max(-r, -l), r), p = f * (f + 2 * l) + c) : (d = Math.max(0, -(a * r + o)), f = d > 0 ? r : Math.min(Math.max(-r, -l), r), p = -d * d + f * (f + 2 * l) + c);
      else f = a > 0 ? -r : r, d = Math.max(0, -(a * f + o)), p = -d * d + f * (f + 2 * l) + c;
      return n && n.copy(this.origin).addScaledVector(this.direction, d), s && s.copy(yr).addScaledVector(gs, f), p;
    }
    intersectSphere(t, e) {
      cn.subVectors(t.center, this.origin);
      const n = cn.dot(this.direction), s = cn.dot(cn) - n * n, r = t.radius * t.radius;
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
      return this.intersectBox(t, cn) !== null;
    }
    intersectTriangle(t, e, n, s, r) {
      Er.subVectors(e, t), _s.subVectors(n, t), br.crossVectors(Er, _s);
      let a = this.direction.dot(br), o;
      if (a > 0) {
        if (s) return null;
        o = 1;
      } else if (a < 0) o = -1, a = -a;
      else return null;
      An.subVectors(this.origin, t);
      const l = o * this.direction.dot(_s.crossVectors(An, _s));
      if (l < 0) return null;
      const c = o * this.direction.dot(Er.cross(An));
      if (c < 0 || l + c > a) return null;
      const h = -o * An.dot(br);
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
  class qt {
    constructor(t, e, n, s, r, a, o, l, c, h, d, f, p, g, _, m) {
      qt.prototype.isMatrix4 = true, this.elements = [
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
      ], t !== void 0 && this.set(t, e, n, s, r, a, o, l, c, h, d, f, p, g, _, m);
    }
    set(t, e, n, s, r, a, o, l, c, h, d, f, p, g, _, m) {
      const u = this.elements;
      return u[0] = t, u[4] = e, u[8] = n, u[12] = s, u[1] = r, u[5] = a, u[9] = o, u[13] = l, u[2] = c, u[6] = h, u[10] = d, u[14] = f, u[3] = p, u[7] = g, u[11] = _, u[15] = m, this;
    }
    identity() {
      return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    clone() {
      return new qt().fromArray(this.elements);
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
      const e = this.elements, n = t.elements, s = 1 / ui.setFromMatrixColumn(t, 0).length(), r = 1 / ui.setFromMatrixColumn(t, 1).length(), a = 1 / ui.setFromMatrixColumn(t, 2).length();
      return e[0] = n[0] * s, e[1] = n[1] * s, e[2] = n[2] * s, e[3] = 0, e[4] = n[4] * r, e[5] = n[5] * r, e[6] = n[6] * r, e[7] = 0, e[8] = n[8] * a, e[9] = n[9] * a, e[10] = n[10] * a, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
    }
    makeRotationFromEuler(t) {
      const e = this.elements, n = t.x, s = t.y, r = t.z, a = Math.cos(n), o = Math.sin(n), l = Math.cos(s), c = Math.sin(s), h = Math.cos(r), d = Math.sin(r);
      if (t.order === "XYZ") {
        const f = a * h, p = a * d, g = o * h, _ = o * d;
        e[0] = l * h, e[4] = -l * d, e[8] = c, e[1] = p + g * c, e[5] = f - _ * c, e[9] = -o * l, e[2] = _ - f * c, e[6] = g + p * c, e[10] = a * l;
      } else if (t.order === "YXZ") {
        const f = l * h, p = l * d, g = c * h, _ = c * d;
        e[0] = f + _ * o, e[4] = g * o - p, e[8] = a * c, e[1] = a * d, e[5] = a * h, e[9] = -o, e[2] = p * o - g, e[6] = _ + f * o, e[10] = a * l;
      } else if (t.order === "ZXY") {
        const f = l * h, p = l * d, g = c * h, _ = c * d;
        e[0] = f - _ * o, e[4] = -a * d, e[8] = g + p * o, e[1] = p + g * o, e[5] = a * h, e[9] = _ - f * o, e[2] = -a * c, e[6] = o, e[10] = a * l;
      } else if (t.order === "ZYX") {
        const f = a * h, p = a * d, g = o * h, _ = o * d;
        e[0] = l * h, e[4] = g * c - p, e[8] = f * c + _, e[1] = l * d, e[5] = _ * c + f, e[9] = p * c - g, e[2] = -c, e[6] = o * l, e[10] = a * l;
      } else if (t.order === "YZX") {
        const f = a * l, p = a * c, g = o * l, _ = o * c;
        e[0] = l * h, e[4] = _ - f * d, e[8] = g * d + p, e[1] = d, e[5] = a * h, e[9] = -o * h, e[2] = -c * h, e[6] = p * d + g, e[10] = f - _ * d;
      } else if (t.order === "XZY") {
        const f = a * l, p = a * c, g = o * l, _ = o * c;
        e[0] = l * h, e[4] = -d, e[8] = c * h, e[1] = f * d + _, e[5] = a * h, e[9] = p * d - g, e[2] = g * d - p, e[6] = o * h, e[10] = _ * d + f;
      }
      return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
    }
    makeRotationFromQuaternion(t) {
      return this.compose(Xd, t, Yd);
    }
    lookAt(t, e, n) {
      const s = this.elements;
      return Fe.subVectors(t, e), Fe.lengthSq() === 0 && (Fe.z = 1), Fe.normalize(), Cn.crossVectors(n, Fe), Cn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Fe.x += 1e-4 : Fe.z += 1e-4, Fe.normalize(), Cn.crossVectors(n, Fe)), Cn.normalize(), vs.crossVectors(Fe, Cn), s[0] = Cn.x, s[4] = vs.x, s[8] = Fe.x, s[1] = Cn.y, s[5] = vs.y, s[9] = Fe.y, s[2] = Cn.z, s[6] = vs.z, s[10] = Fe.z, this;
    }
    multiply(t) {
      return this.multiplyMatrices(this, t);
    }
    premultiply(t) {
      return this.multiplyMatrices(t, this);
    }
    multiplyMatrices(t, e) {
      const n = t.elements, s = e.elements, r = this.elements, a = n[0], o = n[4], l = n[8], c = n[12], h = n[1], d = n[5], f = n[9], p = n[13], g = n[2], _ = n[6], m = n[10], u = n[14], E = n[3], b = n[7], S = n[11], N = n[15], w = s[0], A = s[4], P = s[8], y = s[12], x = s[1], R = s[5], G = s[9], k = s[13], X = s[2], Z = s[6], V = s[10], Q = s[14], H = s[3], st = s[7], ht = s[11], St = s[15];
      return r[0] = a * w + o * x + l * X + c * H, r[4] = a * A + o * R + l * Z + c * st, r[8] = a * P + o * G + l * V + c * ht, r[12] = a * y + o * k + l * Q + c * St, r[1] = h * w + d * x + f * X + p * H, r[5] = h * A + d * R + f * Z + p * st, r[9] = h * P + d * G + f * V + p * ht, r[13] = h * y + d * k + f * Q + p * St, r[2] = g * w + _ * x + m * X + u * H, r[6] = g * A + _ * R + m * Z + u * st, r[10] = g * P + _ * G + m * V + u * ht, r[14] = g * y + _ * k + m * Q + u * St, r[3] = E * w + b * x + S * X + N * H, r[7] = E * A + b * R + S * Z + N * st, r[11] = E * P + b * G + S * V + N * ht, r[15] = E * y + b * k + S * Q + N * St, this;
    }
    multiplyScalar(t) {
      const e = this.elements;
      return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, e[11] *= t, e[15] *= t, this;
    }
    determinant() {
      const t = this.elements, e = t[0], n = t[4], s = t[8], r = t[12], a = t[1], o = t[5], l = t[9], c = t[13], h = t[2], d = t[6], f = t[10], p = t[14], g = t[3], _ = t[7], m = t[11], u = t[15];
      return g * (+r * l * d - s * c * d - r * o * f + n * c * f + s * o * p - n * l * p) + _ * (+e * l * p - e * c * f + r * a * f - s * a * p + s * c * h - r * l * h) + m * (+e * c * d - e * o * p - r * a * d + n * a * p + r * o * h - n * c * h) + u * (-s * o * h - e * l * d + e * o * f + s * a * d - n * a * f + n * l * h);
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
      const t = this.elements, e = t[0], n = t[1], s = t[2], r = t[3], a = t[4], o = t[5], l = t[6], c = t[7], h = t[8], d = t[9], f = t[10], p = t[11], g = t[12], _ = t[13], m = t[14], u = t[15], E = d * m * c - _ * f * c + _ * l * p - o * m * p - d * l * u + o * f * u, b = g * f * c - h * m * c - g * l * p + a * m * p + h * l * u - a * f * u, S = h * _ * c - g * d * c + g * o * p - a * _ * p - h * o * u + a * d * u, N = g * d * l - h * _ * l - g * o * f + a * _ * f + h * o * m - a * d * m, w = e * E + n * b + s * S + r * N;
      if (w === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      const A = 1 / w;
      return t[0] = E * A, t[1] = (_ * f * r - d * m * r - _ * s * p + n * m * p + d * s * u - n * f * u) * A, t[2] = (o * m * r - _ * l * r + _ * s * c - n * m * c - o * s * u + n * l * u) * A, t[3] = (d * l * r - o * f * r - d * s * c + n * f * c + o * s * p - n * l * p) * A, t[4] = b * A, t[5] = (h * m * r - g * f * r + g * s * p - e * m * p - h * s * u + e * f * u) * A, t[6] = (g * l * r - a * m * r - g * s * c + e * m * c + a * s * u - e * l * u) * A, t[7] = (a * f * r - h * l * r + h * s * c - e * f * c - a * s * p + e * l * p) * A, t[8] = S * A, t[9] = (g * d * r - h * _ * r - g * n * p + e * _ * p + h * n * u - e * d * u) * A, t[10] = (a * _ * r - g * o * r + g * n * c - e * _ * c - a * n * u + e * o * u) * A, t[11] = (h * o * r - a * d * r - h * n * c + e * d * c + a * n * p - e * o * p) * A, t[12] = N * A, t[13] = (h * _ * s - g * d * s + g * n * f - e * _ * f - h * n * m + e * d * m) * A, t[14] = (g * o * s - a * _ * s - g * n * l + e * _ * l + a * n * m - e * o * m) * A, t[15] = (a * d * s - h * o * s + h * n * l - e * d * l - a * n * f + e * o * f) * A, this;
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
      const s = this.elements, r = e._x, a = e._y, o = e._z, l = e._w, c = r + r, h = a + a, d = o + o, f = r * c, p = r * h, g = r * d, _ = a * h, m = a * d, u = o * d, E = l * c, b = l * h, S = l * d, N = n.x, w = n.y, A = n.z;
      return s[0] = (1 - (_ + u)) * N, s[1] = (p + S) * N, s[2] = (g - b) * N, s[3] = 0, s[4] = (p - S) * w, s[5] = (1 - (f + u)) * w, s[6] = (m + E) * w, s[7] = 0, s[8] = (g + b) * A, s[9] = (m - E) * A, s[10] = (1 - (f + _)) * A, s[11] = 0, s[12] = t.x, s[13] = t.y, s[14] = t.z, s[15] = 1, this;
    }
    decompose(t, e, n) {
      const s = this.elements;
      let r = ui.set(s[0], s[1], s[2]).length();
      const a = ui.set(s[4], s[5], s[6]).length(), o = ui.set(s[8], s[9], s[10]).length();
      this.determinant() < 0 && (r = -r), t.x = s[12], t.y = s[13], t.z = s[14], qe.copy(this);
      const c = 1 / r, h = 1 / a, d = 1 / o;
      return qe.elements[0] *= c, qe.elements[1] *= c, qe.elements[2] *= c, qe.elements[4] *= h, qe.elements[5] *= h, qe.elements[6] *= h, qe.elements[8] *= d, qe.elements[9] *= d, qe.elements[10] *= d, e.setFromRotationMatrix(qe), n.x = r, n.y = a, n.z = o, this;
    }
    makePerspective(t, e, n, s, r, a, o = mn) {
      const l = this.elements, c = 2 * r / (e - t), h = 2 * r / (n - s), d = (e + t) / (e - t), f = (n + s) / (n - s);
      let p, g;
      if (o === mn) p = -(a + r) / (a - r), g = -2 * a * r / (a - r);
      else if (o === Ks) p = -a / (a - r), g = -a * r / (a - r);
      else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
      return l[0] = c, l[4] = 0, l[8] = d, l[12] = 0, l[1] = 0, l[5] = h, l[9] = f, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = p, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
    }
    makeOrthographic(t, e, n, s, r, a, o = mn) {
      const l = this.elements, c = 1 / (e - t), h = 1 / (n - s), d = 1 / (a - r), f = (e + t) * c, p = (n + s) * h;
      let g, _;
      if (o === mn) g = (a + r) * d, _ = -2 * d;
      else if (o === Ks) g = r * d, _ = -1 * d;
      else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
      return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -f, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -p, l[2] = 0, l[6] = 0, l[10] = _, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
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
  const ui = new C(), qe = new qt(), Xd = new C(0, 0, 0), Yd = new C(1, 1, 1), Cn = new C(), vs = new C(), Fe = new C(), il = new qt(), sl = new Qn();
  class rn {
    constructor(t = 0, e = 0, n = 0, s = rn.DEFAULT_ORDER) {
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
          this._y = Math.asin(Te(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, p), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(f, c), this._z = 0);
          break;
        case "YXZ":
          this._x = Math.asin(-Te(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, p), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, r), this._z = 0);
          break;
        case "ZXY":
          this._x = Math.asin(Te(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-d, p), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, r));
          break;
        case "ZYX":
          this._y = Math.asin(-Te(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(f, p), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-a, c));
          break;
        case "YZX":
          this._z = Math.asin(Te(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, r)) : (this._x = 0, this._y = Math.atan2(o, p));
          break;
        case "XZY":
          this._z = Math.asin(-Te(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, c), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, p), this._y = 0);
          break;
        default:
          console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
      }
      return this._order = e, n === true && this._onChangeCallback(), this;
    }
    setFromQuaternion(t, e, n) {
      return il.makeRotationFromQuaternion(t), this.setFromRotationMatrix(il, e, n);
    }
    setFromVector3(t, e = this._order) {
      return this.set(t.x, t.y, t.z, e);
    }
    reorder(t) {
      return sl.setFromEuler(this), this.setFromQuaternion(sl, t);
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
  rn.DEFAULT_ORDER = "XYZ";
  class ho {
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
  let qd = 0;
  const rl = new C(), di = new Qn(), hn = new qt(), xs = new C(), qi = new C(), jd = new C(), Kd = new Qn(), al = new C(1, 0, 0), ol = new C(0, 1, 0), ll = new C(0, 0, 1), cl = {
    type: "added"
  }, Zd = {
    type: "removed"
  }, fi = {
    type: "childadded",
    child: null
  }, Tr = {
    type: "childremoved",
    child: null
  };
  class Se extends ei {
    constructor() {
      super(), this.isObject3D = true, Object.defineProperty(this, "id", {
        value: qd++
      }), this.uuid = ki(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = Se.DEFAULT_UP.clone();
      const t = new C(), e = new rn(), n = new Qn(), s = new C(1, 1, 1);
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
          value: new qt()
        },
        normalMatrix: {
          value: new It()
        }
      }), this.matrix = new qt(), this.matrixWorld = new qt(), this.matrixAutoUpdate = Se.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = false, this.layers = new ho(), this.visible = true, this.castShadow = false, this.receiveShadow = false, this.frustumCulled = true, this.renderOrder = 0, this.animations = [], this.userData = {};
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
      return di.setFromAxisAngle(t, e), this.quaternion.multiply(di), this;
    }
    rotateOnWorldAxis(t, e) {
      return di.setFromAxisAngle(t, e), this.quaternion.premultiply(di), this;
    }
    rotateX(t) {
      return this.rotateOnAxis(al, t);
    }
    rotateY(t) {
      return this.rotateOnAxis(ol, t);
    }
    rotateZ(t) {
      return this.rotateOnAxis(ll, t);
    }
    translateOnAxis(t, e) {
      return rl.copy(t).applyQuaternion(this.quaternion), this.position.add(rl.multiplyScalar(e)), this;
    }
    translateX(t) {
      return this.translateOnAxis(al, t);
    }
    translateY(t) {
      return this.translateOnAxis(ol, t);
    }
    translateZ(t) {
      return this.translateOnAxis(ll, t);
    }
    localToWorld(t) {
      return this.updateWorldMatrix(true, false), t.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(t) {
      return this.updateWorldMatrix(true, false), t.applyMatrix4(hn.copy(this.matrixWorld).invert());
    }
    lookAt(t, e, n) {
      t.isVector3 ? xs.copy(t) : xs.set(t, e, n);
      const s = this.parent;
      this.updateWorldMatrix(true, false), qi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? hn.lookAt(qi, xs, this.up) : hn.lookAt(xs, qi, this.up), this.quaternion.setFromRotationMatrix(hn), s && (hn.extractRotation(s.matrixWorld), di.setFromRotationMatrix(hn), this.quaternion.premultiply(di.invert()));
    }
    add(t) {
      if (arguments.length > 1) {
        for (let e = 0; e < arguments.length; e++) this.add(arguments[e]);
        return this;
      }
      return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), this) : (t && t.isObject3D ? (t.removeFromParent(), t.parent = this, this.children.push(t), t.dispatchEvent(cl), fi.child = t, this.dispatchEvent(fi), fi.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), this);
    }
    remove(t) {
      if (arguments.length > 1) {
        for (let n = 0; n < arguments.length; n++) this.remove(arguments[n]);
        return this;
      }
      const e = this.children.indexOf(t);
      return e !== -1 && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(Zd), Tr.child = t, this.dispatchEvent(Tr), Tr.child = null), this;
    }
    removeFromParent() {
      const t = this.parent;
      return t !== null && t.remove(this), this;
    }
    clear() {
      return this.remove(...this.children);
    }
    attach(t) {
      return this.updateWorldMatrix(true, false), hn.copy(this.matrixWorld).invert(), t.parent !== null && (t.parent.updateWorldMatrix(true, false), hn.multiply(t.parent.matrixWorld)), t.applyMatrix4(hn), t.removeFromParent(), t.parent = this, this.children.push(t), t.updateWorldMatrix(false, true), t.dispatchEvent(cl), fi.child = t, this.dispatchEvent(fi), fi.child = null, this;
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
      return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(qi, t, jd), t;
    }
    getWorldScale(t) {
      return this.updateWorldMatrix(true, false), this.matrixWorld.decompose(qi, Kd, t), t;
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
  Se.DEFAULT_UP = new C(0, 1, 0);
  Se.DEFAULT_MATRIX_AUTO_UPDATE = true;
  Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;
  const je = new C(), un = new C(), wr = new C(), dn = new C(), pi = new C(), mi = new C(), hl = new C(), Ar = new C(), Cr = new C(), Rr = new C(), Pr = new Qt(), Dr = new Qt(), Lr = new Qt();
  class Ze {
    constructor(t = new C(), e = new C(), n = new C()) {
      this.a = t, this.b = e, this.c = n;
    }
    static getNormal(t, e, n, s) {
      s.subVectors(n, e), je.subVectors(t, e), s.cross(je);
      const r = s.lengthSq();
      return r > 0 ? s.multiplyScalar(1 / Math.sqrt(r)) : s.set(0, 0, 0);
    }
    static getBarycoord(t, e, n, s, r) {
      je.subVectors(s, e), un.subVectors(n, e), wr.subVectors(t, e);
      const a = je.dot(je), o = je.dot(un), l = je.dot(wr), c = un.dot(un), h = un.dot(wr), d = a * c - o * o;
      if (d === 0) return r.set(0, 0, 0), null;
      const f = 1 / d, p = (c * l - o * h) * f, g = (a * h - o * l) * f;
      return r.set(1 - p - g, g, p);
    }
    static containsPoint(t, e, n, s) {
      return this.getBarycoord(t, e, n, s, dn) === null ? false : dn.x >= 0 && dn.y >= 0 && dn.x + dn.y <= 1;
    }
    static getInterpolation(t, e, n, s, r, a, o, l) {
      return this.getBarycoord(t, e, n, s, dn) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(r, dn.x), l.addScaledVector(a, dn.y), l.addScaledVector(o, dn.z), l);
    }
    static getInterpolatedAttribute(t, e, n, s, r, a) {
      return Pr.setScalar(0), Dr.setScalar(0), Lr.setScalar(0), Pr.fromBufferAttribute(t, e), Dr.fromBufferAttribute(t, n), Lr.fromBufferAttribute(t, s), a.setScalar(0), a.addScaledVector(Pr, r.x), a.addScaledVector(Dr, r.y), a.addScaledVector(Lr, r.z), a;
    }
    static isFrontFacing(t, e, n, s) {
      return je.subVectors(n, e), un.subVectors(t, e), je.cross(un).dot(s) < 0;
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
      return je.subVectors(this.c, this.b), un.subVectors(this.a, this.b), je.cross(un).length() * 0.5;
    }
    getMidpoint(t) {
      return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    getNormal(t) {
      return Ze.getNormal(this.a, this.b, this.c, t);
    }
    getPlane(t) {
      return t.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(t, e) {
      return Ze.getBarycoord(t, this.a, this.b, this.c, e);
    }
    getInterpolation(t, e, n, s, r) {
      return Ze.getInterpolation(t, this.a, this.b, this.c, e, n, s, r);
    }
    containsPoint(t) {
      return Ze.containsPoint(t, this.a, this.b, this.c);
    }
    isFrontFacing(t) {
      return Ze.isFrontFacing(this.a, this.b, this.c, t);
    }
    intersectsBox(t) {
      return t.intersectsTriangle(this);
    }
    closestPointToPoint(t, e) {
      const n = this.a, s = this.b, r = this.c;
      let a, o;
      pi.subVectors(s, n), mi.subVectors(r, n), Ar.subVectors(t, n);
      const l = pi.dot(Ar), c = mi.dot(Ar);
      if (l <= 0 && c <= 0) return e.copy(n);
      Cr.subVectors(t, s);
      const h = pi.dot(Cr), d = mi.dot(Cr);
      if (h >= 0 && d <= h) return e.copy(s);
      const f = l * d - h * c;
      if (f <= 0 && l >= 0 && h <= 0) return a = l / (l - h), e.copy(n).addScaledVector(pi, a);
      Rr.subVectors(t, r);
      const p = pi.dot(Rr), g = mi.dot(Rr);
      if (g >= 0 && p <= g) return e.copy(r);
      const _ = p * c - l * g;
      if (_ <= 0 && c >= 0 && g <= 0) return o = c / (c - g), e.copy(n).addScaledVector(mi, o);
      const m = h * g - p * d;
      if (m <= 0 && d - h >= 0 && p - g >= 0) return hl.subVectors(r, s), o = (d - h) / (d - h + (p - g)), e.copy(s).addScaledVector(hl, o);
      const u = 1 / (m + _ + f);
      return a = _ * u, o = f * u, e.copy(n).addScaledVector(pi, a).addScaledVector(mi, o);
    }
    equals(t) {
      return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
    }
  }
  const ih = {
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
  }, Rn = {
    h: 0,
    s: 0,
    l: 0
  }, Ms = {
    h: 0,
    s: 0,
    l: 0
  };
  function Ir(i, t, e) {
    return e < 0 && (e += 1), e > 1 && (e -= 1), e < 1 / 6 ? i + (t - i) * 6 * e : e < 1 / 2 ? t : e < 2 / 3 ? i + (t - i) * 6 * (2 / 3 - e) : i;
  }
  class Et {
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
    setHex(t, e = Be) {
      return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, this.b = (t & 255) / 255, Vt.toWorkingColorSpace(this, e), this;
    }
    setRGB(t, e, n, s = Vt.workingColorSpace) {
      return this.r = t, this.g = e, this.b = n, Vt.toWorkingColorSpace(this, s), this;
    }
    setHSL(t, e, n, s = Vt.workingColorSpace) {
      if (t = co(t, 1), e = Te(e, 0, 1), n = Te(n, 0, 1), e === 0) this.r = this.g = this.b = n;
      else {
        const r = n <= 0.5 ? n * (1 + e) : n + e - n * e, a = 2 * n - r;
        this.r = Ir(a, r, t + 1 / 3), this.g = Ir(a, r, t), this.b = Ir(a, r, t - 1 / 3);
      }
      return Vt.toWorkingColorSpace(this, s), this;
    }
    setStyle(t, e = Be) {
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
    setColorName(t, e = Be) {
      const n = ih[t.toLowerCase()];
      return n !== void 0 ? this.setHex(n, e) : console.warn("THREE.Color: Unknown color " + t), this;
    }
    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }
    copy(t) {
      return this.r = t.r, this.g = t.g, this.b = t.b, this;
    }
    copySRGBToLinear(t) {
      return this.r = xn(t.r), this.g = xn(t.g), this.b = xn(t.b), this;
    }
    copyLinearToSRGB(t) {
      return this.r = Ci(t.r), this.g = Ci(t.g), this.b = Ci(t.b), this;
    }
    convertSRGBToLinear() {
      return this.copySRGBToLinear(this), this;
    }
    convertLinearToSRGB() {
      return this.copyLinearToSRGB(this), this;
    }
    getHex(t = Be) {
      return Vt.fromWorkingColorSpace(be.copy(this), t), Math.round(Te(be.r * 255, 0, 255)) * 65536 + Math.round(Te(be.g * 255, 0, 255)) * 256 + Math.round(Te(be.b * 255, 0, 255));
    }
    getHexString(t = Be) {
      return ("000000" + this.getHex(t).toString(16)).slice(-6);
    }
    getHSL(t, e = Vt.workingColorSpace) {
      Vt.fromWorkingColorSpace(be.copy(this), e);
      const n = be.r, s = be.g, r = be.b, a = Math.max(n, s, r), o = Math.min(n, s, r);
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
    getRGB(t, e = Vt.workingColorSpace) {
      return Vt.fromWorkingColorSpace(be.copy(this), e), t.r = be.r, t.g = be.g, t.b = be.b, t;
    }
    getStyle(t = Be) {
      Vt.fromWorkingColorSpace(be.copy(this), t);
      const e = be.r, n = be.g, s = be.b;
      return t !== Be ? `color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})` : `rgb(${Math.round(e * 255)},${Math.round(n * 255)},${Math.round(s * 255)})`;
    }
    offsetHSL(t, e, n) {
      return this.getHSL(Rn), this.setHSL(Rn.h + t, Rn.s + e, Rn.l + n);
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
      this.getHSL(Rn), t.getHSL(Ms);
      const n = is(Rn.h, Ms.h, e), s = is(Rn.s, Ms.s, e), r = is(Rn.l, Ms.l, e);
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
  const be = new Et();
  Et.NAMES = ih;
  let $d = 0;
  class si extends ei {
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
        value: $d++
      }), this.uuid = ki(), this.name = "", this.blending = wi, this.side = Fn, this.vertexColors = false, this.opacity = 1, this.transparent = false, this.alphaHash = false, this.blendSrc = na, this.blendDst = ia, this.blendEquation = qn, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Et(0, 0, 0), this.blendAlpha = 0, this.depthFunc = Ri, this.depthTest = true, this.depthWrite = true, this.stencilWriteMask = 255, this.stencilFunc = Yo, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = ai, this.stencilZFail = ai, this.stencilZPass = ai, this.stencilWrite = false, this.clippingPlanes = null, this.clipIntersection = false, this.clipShadows = false, this.shadowSide = null, this.colorWrite = true, this.precision = null, this.polygonOffset = false, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = false, this.alphaToCoverage = false, this.premultipliedAlpha = false, this.forceSinglePass = false, this.visible = true, this.toneMapped = true, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
      n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(t).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(t).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(t).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(t).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(t).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(t).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(t).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(t).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(t).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(t).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(t).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(t).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(t).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(t).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(t).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(t).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(t).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== wi && (n.blending = this.blending), this.side !== Fn && (n.side = this.side), this.vertexColors === true && (n.vertexColors = true), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === true && (n.transparent = true), this.blendSrc !== na && (n.blendSrc = this.blendSrc), this.blendDst !== ia && (n.blendDst = this.blendDst), this.blendEquation !== qn && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== Ri && (n.depthFunc = this.depthFunc), this.depthTest === false && (n.depthTest = this.depthTest), this.depthWrite === false && (n.depthWrite = this.depthWrite), this.colorWrite === false && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== Yo && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== ai && (n.stencilFail = this.stencilFail), this.stencilZFail !== ai && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== ai && (n.stencilZPass = this.stencilZPass), this.stencilWrite === true && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === true && (n.polygonOffset = true), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === true && (n.dithering = true), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === true && (n.alphaHash = true), this.alphaToCoverage === true && (n.alphaToCoverage = true), this.premultipliedAlpha === true && (n.premultipliedAlpha = true), this.forceSinglePass === true && (n.forceSinglePass = true), this.wireframe === true && (n.wireframe = true), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === true && (n.flatShading = true), this.visible === false && (n.visible = false), this.toneMapped === false && (n.toneMapped = false), this.fog === false && (n.fog = false), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
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
  class Ui extends si {
    static get type() {
      return "MeshBasicMaterial";
    }
    constructor(t) {
      super(), this.isMeshBasicMaterial = true, this.color = new Et(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new rn(), this.combine = Nc, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
    }
  }
  const fe = new C(), Ss = new _t();
  class xe {
    constructor(t, e, n = false) {
      if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
      this.isBufferAttribute = true, this.name = "", this.array = t, this.itemSize = e, this.count = t !== void 0 ? t.length / e : 0, this.normalized = n, this.usage = qo, this.updateRanges = [], this.gpuType = nn, this.version = 0;
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
      if (this.itemSize === 2) for (let e = 0, n = this.count; e < n; e++) Ss.fromBufferAttribute(this, e), Ss.applyMatrix3(t), this.setXY(e, Ss.x, Ss.y);
      else if (this.itemSize === 3) for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.applyMatrix3(t), this.setXYZ(e, fe.x, fe.y, fe.z);
      return this;
    }
    applyMatrix4(t) {
      for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.applyMatrix4(t), this.setXYZ(e, fe.x, fe.y, fe.z);
      return this;
    }
    applyNormalMatrix(t) {
      for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.applyNormalMatrix(t), this.setXYZ(e, fe.x, fe.y, fe.z);
      return this;
    }
    transformDirection(t) {
      for (let e = 0, n = this.count; e < n; e++) fe.fromBufferAttribute(this, e), fe.transformDirection(t), this.setXYZ(e, fe.x, fe.y, fe.z);
      return this;
    }
    set(t, e = 0) {
      return this.array.set(t, e), this;
    }
    getComponent(t, e) {
      let n = this.array[t * this.itemSize + e];
      return this.normalized && (n = Si(n, this.array)), n;
    }
    setComponent(t, e, n) {
      return this.normalized && (n = we(n, this.array)), this.array[t * this.itemSize + e] = n, this;
    }
    getX(t) {
      let e = this.array[t * this.itemSize];
      return this.normalized && (e = Si(e, this.array)), e;
    }
    setX(t, e) {
      return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize] = e, this;
    }
    getY(t) {
      let e = this.array[t * this.itemSize + 1];
      return this.normalized && (e = Si(e, this.array)), e;
    }
    setY(t, e) {
      return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize + 1] = e, this;
    }
    getZ(t) {
      let e = this.array[t * this.itemSize + 2];
      return this.normalized && (e = Si(e, this.array)), e;
    }
    setZ(t, e) {
      return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize + 2] = e, this;
    }
    getW(t) {
      let e = this.array[t * this.itemSize + 3];
      return this.normalized && (e = Si(e, this.array)), e;
    }
    setW(t, e) {
      return this.normalized && (e = we(e, this.array)), this.array[t * this.itemSize + 3] = e, this;
    }
    setXY(t, e, n) {
      return t *= this.itemSize, this.normalized && (e = we(e, this.array), n = we(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this;
    }
    setXYZ(t, e, n, s) {
      return t *= this.itemSize, this.normalized && (e = we(e, this.array), n = we(n, this.array), s = we(s, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this;
    }
    setXYZW(t, e, n, s, r) {
      return t *= this.itemSize, this.normalized && (e = we(e, this.array), n = we(n, this.array), s = we(s, this.array), r = we(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = n, this.array[t + 2] = s, this.array[t + 3] = r, this;
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
      return this.name !== "" && (t.name = this.name), this.usage !== qo && (t.usage = this.usage), t;
    }
  }
  class sh extends xe {
    constructor(t, e, n) {
      super(new Uint16Array(t), e, n);
    }
  }
  class rh extends xe {
    constructor(t, e, n) {
      super(new Uint32Array(t), e, n);
    }
  }
  class ue extends xe {
    constructor(t, e, n) {
      super(new Float32Array(t), e, n);
    }
  }
  let Jd = 0;
  const Ge = new qt(), Ur = new Se(), gi = new C(), Oe = new ni(), ji = new ni(), ve = new C();
  class Me extends ei {
    constructor() {
      super(), this.isBufferGeometry = true, Object.defineProperty(this, "id", {
        value: Jd++
      }), this.uuid = ki(), this.name = "", this.type = "BufferGeometry", this.index = null, this.indirect = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = false, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
        start: 0,
        count: 1 / 0
      }, this.userData = {};
    }
    getIndex() {
      return this.index;
    }
    setIndex(t) {
      return Array.isArray(t) ? this.index = new (th(t) ? rh : sh)(t, 1) : this.index = t, this;
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
        const r = new It().getNormalMatrix(t);
        n.applyNormalMatrix(r), n.needsUpdate = true;
      }
      const s = this.attributes.tangent;
      return s !== void 0 && (s.transformDirection(t), s.needsUpdate = true), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
    }
    applyQuaternion(t) {
      return Ge.makeRotationFromQuaternion(t), this.applyMatrix4(Ge), this;
    }
    rotateX(t) {
      return Ge.makeRotationX(t), this.applyMatrix4(Ge), this;
    }
    rotateY(t) {
      return Ge.makeRotationY(t), this.applyMatrix4(Ge), this;
    }
    rotateZ(t) {
      return Ge.makeRotationZ(t), this.applyMatrix4(Ge), this;
    }
    translate(t, e, n) {
      return Ge.makeTranslation(t, e, n), this.applyMatrix4(Ge), this;
    }
    scale(t, e, n) {
      return Ge.makeScale(t, e, n), this.applyMatrix4(Ge), this;
    }
    lookAt(t) {
      return Ur.lookAt(t), Ur.updateMatrix(), this.applyMatrix4(Ur.matrix), this;
    }
    center() {
      return this.computeBoundingBox(), this.boundingBox.getCenter(gi).negate(), this.translate(gi.x, gi.y, gi.z), this;
    }
    setFromPoints(t) {
      const e = this.getAttribute("position");
      if (e === void 0) {
        const n = [];
        for (let s = 0, r = t.length; s < r; s++) {
          const a = t[s];
          n.push(a.x, a.y, a.z || 0);
        }
        this.setAttribute("position", new ue(n, 3));
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
      this.boundingBox === null && (this.boundingBox = new ni());
      const t = this.attributes.position, e = this.morphAttributes.position;
      if (t && t.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(new C(-1 / 0, -1 / 0, -1 / 0), new C(1 / 0, 1 / 0, 1 / 0));
        return;
      }
      if (t !== void 0) {
        if (this.boundingBox.setFromBufferAttribute(t), e) for (let n = 0, s = e.length; n < s; n++) {
          const r = e[n];
          Oe.setFromBufferAttribute(r), this.morphTargetsRelative ? (ve.addVectors(this.boundingBox.min, Oe.min), this.boundingBox.expandByPoint(ve), ve.addVectors(this.boundingBox.max, Oe.max), this.boundingBox.expandByPoint(ve)) : (this.boundingBox.expandByPoint(Oe.min), this.boundingBox.expandByPoint(Oe.max));
        }
      } else this.boundingBox.makeEmpty();
      (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
    computeBoundingSphere() {
      this.boundingSphere === null && (this.boundingSphere = new ii());
      const t = this.attributes.position, e = this.morphAttributes.position;
      if (t && t.isGLBufferAttribute) {
        console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new C(), 1 / 0);
        return;
      }
      if (t) {
        const n = this.boundingSphere.center;
        if (Oe.setFromBufferAttribute(t), e) for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r];
          ji.setFromBufferAttribute(o), this.morphTargetsRelative ? (ve.addVectors(Oe.min, ji.min), Oe.expandByPoint(ve), ve.addVectors(Oe.max, ji.max), Oe.expandByPoint(ve)) : (Oe.expandByPoint(ji.min), Oe.expandByPoint(ji.max));
        }
        Oe.getCenter(n);
        let s = 0;
        for (let r = 0, a = t.count; r < a; r++) ve.fromBufferAttribute(t, r), s = Math.max(s, n.distanceToSquared(ve));
        if (e) for (let r = 0, a = e.length; r < a; r++) {
          const o = e[r], l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++) ve.fromBufferAttribute(o, c), l && (gi.fromBufferAttribute(t, c), ve.add(gi)), s = Math.max(s, n.distanceToSquared(ve));
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
      for (let P = 0; P < n.count; P++) o[P] = new C(), l[P] = new C();
      const c = new C(), h = new C(), d = new C(), f = new _t(), p = new _t(), g = new _t(), _ = new C(), m = new C();
      function u(P, y, x) {
        c.fromBufferAttribute(n, P), h.fromBufferAttribute(n, y), d.fromBufferAttribute(n, x), f.fromBufferAttribute(r, P), p.fromBufferAttribute(r, y), g.fromBufferAttribute(r, x), h.sub(c), d.sub(c), p.sub(f), g.sub(f);
        const R = 1 / (p.x * g.y - g.x * p.y);
        isFinite(R) && (_.copy(h).multiplyScalar(g.y).addScaledVector(d, -p.y).multiplyScalar(R), m.copy(d).multiplyScalar(p.x).addScaledVector(h, -g.x).multiplyScalar(R), o[P].add(_), o[y].add(_), o[x].add(_), l[P].add(m), l[y].add(m), l[x].add(m));
      }
      let E = this.groups;
      E.length === 0 && (E = [
        {
          start: 0,
          count: t.count
        }
      ]);
      for (let P = 0, y = E.length; P < y; ++P) {
        const x = E[P], R = x.start, G = x.count;
        for (let k = R, X = R + G; k < X; k += 3) u(t.getX(k + 0), t.getX(k + 1), t.getX(k + 2));
      }
      const b = new C(), S = new C(), N = new C(), w = new C();
      function A(P) {
        N.fromBufferAttribute(s, P), w.copy(N);
        const y = o[P];
        b.copy(y), b.sub(N.multiplyScalar(N.dot(y))).normalize(), S.crossVectors(w, y);
        const R = S.dot(l[P]) < 0 ? -1 : 1;
        a.setXYZW(P, b.x, b.y, b.z, R);
      }
      for (let P = 0, y = E.length; P < y; ++P) {
        const x = E[P], R = x.start, G = x.count;
        for (let k = R, X = R + G; k < X; k += 3) A(t.getX(k + 0)), A(t.getX(k + 1)), A(t.getX(k + 2));
      }
    }
    computeVertexNormals() {
      const t = this.index, e = this.getAttribute("position");
      if (e !== void 0) {
        let n = this.getAttribute("normal");
        if (n === void 0) n = new xe(new Float32Array(e.count * 3), 3), this.setAttribute("normal", n);
        else for (let f = 0, p = n.count; f < p; f++) n.setXYZ(f, 0, 0, 0);
        const s = new C(), r = new C(), a = new C(), o = new C(), l = new C(), c = new C(), h = new C(), d = new C();
        if (t) for (let f = 0, p = t.count; f < p; f += 3) {
          const g = t.getX(f + 0), _ = t.getX(f + 1), m = t.getX(f + 2);
          s.fromBufferAttribute(e, g), r.fromBufferAttribute(e, _), a.fromBufferAttribute(e, m), h.subVectors(a, r), d.subVectors(s, r), h.cross(d), o.fromBufferAttribute(n, g), l.fromBufferAttribute(n, _), c.fromBufferAttribute(n, m), o.add(h), l.add(h), c.add(h), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(_, l.x, l.y, l.z), n.setXYZ(m, c.x, c.y, c.z);
        }
        else for (let f = 0, p = e.count; f < p; f += 3) s.fromBufferAttribute(e, f + 0), r.fromBufferAttribute(e, f + 1), a.fromBufferAttribute(e, f + 2), h.subVectors(a, r), d.subVectors(s, r), h.cross(d), n.setXYZ(f + 0, h.x, h.y, h.z), n.setXYZ(f + 1, h.x, h.y, h.z), n.setXYZ(f + 2, h.x, h.y, h.z);
        this.normalizeNormals(), n.needsUpdate = true;
      }
    }
    normalizeNormals() {
      const t = this.attributes.normal;
      for (let e = 0, n = t.count; e < n; e++) ve.fromBufferAttribute(t, e), ve.normalize(), t.setXYZ(e, ve.x, ve.y, ve.z);
    }
    toNonIndexed() {
      function t(o, l) {
        const c = o.array, h = o.itemSize, d = o.normalized, f = new c.constructor(l.length * h);
        let p = 0, g = 0;
        for (let _ = 0, m = l.length; _ < m; _++) {
          o.isInterleavedBufferAttribute ? p = l[_] * o.data.stride + o.offset : p = l[_] * h;
          for (let u = 0; u < h; u++) f[g++] = c[p++];
        }
        return new xe(f, h, d);
      }
      if (this.index === null) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
      const e = new Me(), n = this.index.array, s = this.attributes;
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
  const ul = new qt(), Hn = new ls(), ys = new ii(), dl = new C(), Es = new C(), bs = new C(), Ts = new C(), Nr = new C(), ws = new C(), fl = new C(), As = new C();
  class he extends Se {
    constructor(t = new Me(), e = new Ui()) {
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
        ws.set(0, 0, 0);
        for (let l = 0, c = r.length; l < c; l++) {
          const h = o[l], d = r[l];
          h !== 0 && (Nr.fromBufferAttribute(d, t), a ? ws.addScaledVector(Nr, h) : ws.addScaledVector(Nr.sub(e), h));
        }
        e.add(ws);
      }
      return e;
    }
    raycast(t, e) {
      const n = this.geometry, s = this.material, r = this.matrixWorld;
      s !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), ys.copy(n.boundingSphere), ys.applyMatrix4(r), Hn.copy(t.ray).recast(t.near), !(ys.containsPoint(Hn.origin) === false && (Hn.intersectSphere(ys, dl) === null || Hn.origin.distanceToSquared(dl) > (t.far - t.near) ** 2)) && (ul.copy(r).invert(), Hn.copy(t.ray).applyMatrix4(ul), !(n.boundingBox !== null && Hn.intersectsBox(n.boundingBox) === false) && this._computeIntersections(t, e, Hn)));
    }
    _computeIntersections(t, e, n) {
      let s;
      const r = this.geometry, a = this.material, o = r.index, l = r.attributes.position, c = r.attributes.uv, h = r.attributes.uv1, d = r.attributes.normal, f = r.groups, p = r.drawRange;
      if (o !== null) if (Array.isArray(a)) for (let g = 0, _ = f.length; g < _; g++) {
        const m = f[g], u = a[m.materialIndex], E = Math.max(m.start, p.start), b = Math.min(o.count, Math.min(m.start + m.count, p.start + p.count));
        for (let S = E, N = b; S < N; S += 3) {
          const w = o.getX(S), A = o.getX(S + 1), P = o.getX(S + 2);
          s = Cs(this, u, t, n, c, h, d, w, A, P), s && (s.faceIndex = Math.floor(S / 3), s.face.materialIndex = m.materialIndex, e.push(s));
        }
      }
      else {
        const g = Math.max(0, p.start), _ = Math.min(o.count, p.start + p.count);
        for (let m = g, u = _; m < u; m += 3) {
          const E = o.getX(m), b = o.getX(m + 1), S = o.getX(m + 2);
          s = Cs(this, a, t, n, c, h, d, E, b, S), s && (s.faceIndex = Math.floor(m / 3), e.push(s));
        }
      }
      else if (l !== void 0) if (Array.isArray(a)) for (let g = 0, _ = f.length; g < _; g++) {
        const m = f[g], u = a[m.materialIndex], E = Math.max(m.start, p.start), b = Math.min(l.count, Math.min(m.start + m.count, p.start + p.count));
        for (let S = E, N = b; S < N; S += 3) {
          const w = S, A = S + 1, P = S + 2;
          s = Cs(this, u, t, n, c, h, d, w, A, P), s && (s.faceIndex = Math.floor(S / 3), s.face.materialIndex = m.materialIndex, e.push(s));
        }
      }
      else {
        const g = Math.max(0, p.start), _ = Math.min(l.count, p.start + p.count);
        for (let m = g, u = _; m < u; m += 3) {
          const E = m, b = m + 1, S = m + 2;
          s = Cs(this, a, t, n, c, h, d, E, b, S), s && (s.faceIndex = Math.floor(m / 3), e.push(s));
        }
      }
    }
  }
  function Qd(i, t, e, n, s, r, a, o) {
    let l;
    if (t.side === Ue ? l = n.intersectTriangle(a, r, s, true, o) : l = n.intersectTriangle(s, r, a, t.side === Fn, o), l === null) return null;
    As.copy(o), As.applyMatrix4(i.matrixWorld);
    const c = e.ray.origin.distanceTo(As);
    return c < e.near || c > e.far ? null : {
      distance: c,
      point: As.clone(),
      object: i
    };
  }
  function Cs(i, t, e, n, s, r, a, o, l, c) {
    i.getVertexPosition(o, Es), i.getVertexPosition(l, bs), i.getVertexPosition(c, Ts);
    const h = Qd(i, t, e, n, Es, bs, Ts, fl);
    if (h) {
      const d = new C();
      Ze.getBarycoord(fl, Es, bs, Ts, d), s && (h.uv = Ze.getInterpolatedAttribute(s, o, l, c, d, new _t())), r && (h.uv1 = Ze.getInterpolatedAttribute(r, o, l, c, d, new _t())), a && (h.normal = Ze.getInterpolatedAttribute(a, o, l, c, d, new C()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
      const f = {
        a: o,
        b: l,
        c,
        normal: new C(),
        materialIndex: 0
      };
      Ze.getNormal(Es, bs, Ts, f.normal), h.face = f, h.barycoord = d;
    }
    return h;
  }
  class cs extends Me {
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
      g("z", "y", "x", -1, -1, n, e, t, a, r, 0), g("z", "y", "x", 1, -1, n, e, -t, a, r, 1), g("x", "z", "y", 1, 1, t, n, e, s, a, 2), g("x", "z", "y", 1, -1, t, n, -e, s, a, 3), g("x", "y", "z", 1, -1, t, e, n, s, r, 4), g("x", "y", "z", -1, -1, t, e, -n, s, r, 5), this.setIndex(l), this.setAttribute("position", new ue(c, 3)), this.setAttribute("normal", new ue(h, 3)), this.setAttribute("uv", new ue(d, 2));
      function g(_, m, u, E, b, S, N, w, A, P, y) {
        const x = S / A, R = N / P, G = S / 2, k = N / 2, X = w / 2, Z = A + 1, V = P + 1;
        let Q = 0, H = 0;
        const st = new C();
        for (let ht = 0; ht < V; ht++) {
          const St = ht * R - k;
          for (let Ft = 0; Ft < Z; Ft++) {
            const te = Ft * x - G;
            st[_] = te * E, st[m] = St * b, st[u] = X, c.push(st.x, st.y, st.z), st[_] = 0, st[m] = 0, st[u] = w > 0 ? 1 : -1, h.push(st.x, st.y, st.z), d.push(Ft / A), d.push(1 - ht / P), Q += 1;
          }
        }
        for (let ht = 0; ht < P; ht++) for (let St = 0; St < A; St++) {
          const Ft = f + St + Z * ht, te = f + St + Z * (ht + 1), Y = f + (St + 1) + Z * (ht + 1), tt = f + (St + 1) + Z * ht;
          l.push(Ft, te, tt), l.push(te, Y, tt), H += 6;
        }
        o.addGroup(p, H, y), p += H, f += Q;
      }
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new cs(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
    }
  }
  function Ni(i) {
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
      const n = Ni(i[e]);
      for (const s in n) t[s] = n[s];
    }
    return t;
  }
  function tf(i) {
    const t = [];
    for (let e = 0; e < i.length; e++) t.push(i[e].clone());
    return t;
  }
  function ah(i) {
    const t = i.getRenderTarget();
    return t === null ? i.outputColorSpace : t.isXRRenderTarget === true ? t.texture.colorSpace : Vt.workingColorSpace;
  }
  const as = {
    clone: Ni,
    merge: Ae
  };
  var ef = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, nf = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
  class ae extends si {
    static get type() {
      return "ShaderMaterial";
    }
    constructor(t) {
      super(), this.isShaderMaterial = true, this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = ef, this.fragmentShader = nf, this.linewidth = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.fog = false, this.lights = false, this.clipping = false, this.forceSinglePass = true, this.extensions = {
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
      return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, this.uniforms = Ni(t.uniforms), this.uniformsGroups = tf(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, this;
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
  class oh extends Se {
    constructor() {
      super(), this.isCamera = true, this.type = "Camera", this.matrixWorldInverse = new qt(), this.projectionMatrix = new qt(), this.projectionMatrixInverse = new qt(), this.coordinateSystem = mn;
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
  const Pn = new C(), pl = new _t(), ml = new _t();
  class Ie extends oh {
    constructor(t = 50, e = 1, n = 0.1, s = 2e3) {
      super(), this.isPerspectiveCamera = true, this.type = "PerspectiveCamera", this.fov = t, this.zoom = 1, this.near = n, this.far = s, this.focus = 10, this.aspect = e, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
    }
    copy(t, e) {
      return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = t.view === null ? null : Object.assign({}, t.view), this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
    }
    setFocalLength(t) {
      const e = 0.5 * this.getFilmHeight() / t;
      this.fov = rs * 2 * Math.atan(e), this.updateProjectionMatrix();
    }
    getFocalLength() {
      const t = Math.tan(ns * 0.5 * this.fov);
      return 0.5 * this.getFilmHeight() / t;
    }
    getEffectiveFOV() {
      return rs * 2 * Math.atan(Math.tan(ns * 0.5 * this.fov) / this.zoom);
    }
    getFilmWidth() {
      return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
      return this.filmGauge / Math.max(this.aspect, 1);
    }
    getViewBounds(t, e, n) {
      Pn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), e.set(Pn.x, Pn.y).multiplyScalar(-t / Pn.z), Pn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Pn.x, Pn.y).multiplyScalar(-t / Pn.z);
    }
    getViewSize(t, e) {
      return this.getViewBounds(t, pl, ml), e.subVectors(ml, pl);
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
      let e = t * Math.tan(ns * 0.5 * this.fov) / this.zoom, n = 2 * e, s = this.aspect * n, r = -0.5 * s;
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
  const _i = -90, vi = 1;
  class sf extends Se {
    constructor(t, e, n) {
      super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
      const s = new Ie(_i, vi, t, e);
      s.layers = this.layers, this.add(s);
      const r = new Ie(_i, vi, t, e);
      r.layers = this.layers, this.add(r);
      const a = new Ie(_i, vi, t, e);
      a.layers = this.layers, this.add(a);
      const o = new Ie(_i, vi, t, e);
      o.layers = this.layers, this.add(o);
      const l = new Ie(_i, vi, t, e);
      l.layers = this.layers, this.add(l);
      const c = new Ie(_i, vi, t, e);
      c.layers = this.layers, this.add(c);
    }
    updateCoordinateSystem() {
      const t = this.coordinateSystem, e = this.children.concat(), [n, s, r, a, o, l] = e;
      for (const c of e) this.remove(c);
      if (t === mn) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), s.up.set(0, 1, 0), s.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
      else if (t === Ks) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), s.up.set(0, -1, 0), s.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
      else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + t);
      for (const c of e) this.add(c), c.updateMatrixWorld();
    }
    update(t, e) {
      this.parent === null && this.updateMatrixWorld();
      const { renderTarget: n, activeMipmapLevel: s } = this;
      this.coordinateSystem !== t.coordinateSystem && (this.coordinateSystem = t.coordinateSystem, this.updateCoordinateSystem());
      const [r, a, o, l, c, h] = this.children, d = t.getRenderTarget(), f = t.getActiveCubeFace(), p = t.getActiveMipmapLevel(), g = t.xr.enabled;
      t.xr.enabled = false;
      const _ = n.texture.generateMipmaps;
      n.texture.generateMipmaps = false, t.setRenderTarget(n, 0, s), t.render(e, r), t.setRenderTarget(n, 1, s), t.render(e, a), t.setRenderTarget(n, 2, s), t.render(e, o), t.setRenderTarget(n, 3, s), t.render(e, l), t.setRenderTarget(n, 4, s), t.render(e, c), n.texture.generateMipmaps = _, t.setRenderTarget(n, 5, s), t.render(e, h), t.setRenderTarget(d, f, p), t.xr.enabled = g, n.texture.needsPMREMUpdate = true;
    }
  }
  class lh extends Re {
    constructor(t, e, n, s, r, a, o, l, c, h) {
      t = t !== void 0 ? t : [], e = e !== void 0 ? e : Pi, super(t, e, n, s, r, a, o, l, c, h), this.isCubeTexture = true, this.flipY = false;
    }
    get images() {
      return this.image;
    }
    set images(t) {
      this.image = t;
    }
  }
  class rf extends Je {
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
      this.texture = new lh(s, e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.format, e.type, e.anisotropy, e.colorSpace), this.texture.isRenderTargetTexture = true, this.texture.generateMipmaps = e.generateMipmaps !== void 0 ? e.generateMipmaps : false, this.texture.minFilter = e.minFilter !== void 0 ? e.minFilter : en;
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
      }, s = new cs(5, 5, 5), r = new ae({
        name: "CubemapFromEquirect",
        uniforms: Ni(n.uniforms),
        vertexShader: n.vertexShader,
        fragmentShader: n.fragmentShader,
        side: Ue,
        blending: _n
      });
      r.uniforms.tEquirect.value = e;
      const a = new he(s, r), o = e.minFilter;
      return e.minFilter === Zn && (e.minFilter = en), new sf(1, 10, this).update(t, a), e.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
    }
    clear(t, e, n, s) {
      const r = t.getRenderTarget();
      for (let a = 0; a < 6; a++) t.setRenderTarget(this, a), t.clear(e, n, s);
      t.setRenderTarget(r);
    }
  }
  const Fr = new C(), af = new C(), of = new It();
  class Ln {
    constructor(t = new C(1, 0, 0), e = 0) {
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
      const s = Fr.subVectors(n, e).cross(af.subVectors(t, e)).normalize();
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
      const n = t.delta(Fr), s = this.normal.dot(n);
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
      const n = e || of.getNormalMatrix(t), s = this.coplanarPoint(Fr).applyMatrix4(t), r = this.normal.applyMatrix3(n).normalize();
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
  const Gn = new ii(), Rs = new C();
  class uo {
    constructor(t = new Ln(), e = new Ln(), n = new Ln(), s = new Ln(), r = new Ln(), a = new Ln()) {
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
    setFromProjectionMatrix(t, e = mn) {
      const n = this.planes, s = t.elements, r = s[0], a = s[1], o = s[2], l = s[3], c = s[4], h = s[5], d = s[6], f = s[7], p = s[8], g = s[9], _ = s[10], m = s[11], u = s[12], E = s[13], b = s[14], S = s[15];
      if (n[0].setComponents(l - r, f - c, m - p, S - u).normalize(), n[1].setComponents(l + r, f + c, m + p, S + u).normalize(), n[2].setComponents(l + a, f + h, m + g, S + E).normalize(), n[3].setComponents(l - a, f - h, m - g, S - E).normalize(), n[4].setComponents(l - o, f - d, m - _, S - b).normalize(), e === mn) n[5].setComponents(l + o, f + d, m + _, S + b).normalize();
      else if (e === Ks) n[5].setComponents(o, d, _, b).normalize();
      else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + e);
      return this;
    }
    intersectsObject(t) {
      if (t.boundingSphere !== void 0) t.boundingSphere === null && t.computeBoundingSphere(), Gn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);
      else {
        const e = t.geometry;
        e.boundingSphere === null && e.computeBoundingSphere(), Gn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
      }
      return this.intersectsSphere(Gn);
    }
    intersectsSprite(t) {
      return Gn.center.set(0, 0, 0), Gn.radius = 0.7071067811865476, Gn.applyMatrix4(t.matrixWorld), this.intersectsSphere(Gn);
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
        if (Rs.x = s.normal.x > 0 ? t.max.x : t.min.x, Rs.y = s.normal.y > 0 ? t.max.y : t.min.y, Rs.z = s.normal.z > 0 ? t.max.z : t.min.z, s.distanceToPoint(Rs) < 0) return false;
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
  function ch() {
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
  function lf(i) {
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
          const g = d[f], _ = d[p];
          _.start <= g.start + g.count + 1 ? g.count = Math.max(g.count, _.start + _.count - g.start) : (++f, d[f] = _);
        }
        d.length = f + 1;
        for (let p = 0, g = d.length; p < g; p++) {
          const _ = d[p];
          i.bufferSubData(c, _.start * h.BYTES_PER_ELEMENT, h, _.start, _.count);
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
  class Mn extends Me {
    constructor(t = 1, e = 1, n = 1, s = 1) {
      super(), this.type = "PlaneGeometry", this.parameters = {
        width: t,
        height: e,
        widthSegments: n,
        heightSegments: s
      };
      const r = t / 2, a = e / 2, o = Math.floor(n), l = Math.floor(s), c = o + 1, h = l + 1, d = t / o, f = e / l, p = [], g = [], _ = [], m = [];
      for (let u = 0; u < h; u++) {
        const E = u * f - a;
        for (let b = 0; b < c; b++) {
          const S = b * d - r;
          g.push(S, -E, 0), _.push(0, 0, 1), m.push(b / o), m.push(1 - u / l);
        }
      }
      for (let u = 0; u < l; u++) for (let E = 0; E < o; E++) {
        const b = E + c * u, S = E + c * (u + 1), N = E + 1 + c * (u + 1), w = E + 1 + c * u;
        p.push(b, S, w), p.push(S, N, w);
      }
      this.setIndex(p), this.setAttribute("position", new ue(g, 3)), this.setAttribute("normal", new ue(_, 3)), this.setAttribute("uv", new ue(m, 2));
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new Mn(t.width, t.height, t.widthSegments, t.heightSegments);
    }
  }
  var cf = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, hf = `#ifdef USE_ALPHAHASH
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
#endif`, uf = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, df = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, ff = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, pf = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, mf = `#ifdef USE_AOMAP
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
#endif`, gf = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, _f = `#ifdef USE_BATCHING
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
#endif`, vf = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, xf = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, Mf = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, Sf = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, yf = `#ifdef USE_IRIDESCENCE
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
#endif`, Ef = `#ifdef USE_BUMPMAP
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
#endif`, bf = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, Tf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, wf = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, Af = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Cf = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, Rf = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, Pf = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Df = `#if defined( USE_COLOR_ALPHA )
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
#endif`, Lf = `#define PI 3.141592653589793
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
} // validated`, If = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, Uf = `vec3 transformedNormal = objectNormal;
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
#endif`, Nf = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Ff = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Of = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Bf = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, kf = "gl_FragColor = linearToOutputTexel( gl_FragColor );", zf = `vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, Hf = `#ifdef USE_ENVMAP
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
#endif`, Gf = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Vf = `#ifdef USE_ENVMAP
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
#endif`, Wf = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Xf = `#ifdef USE_ENVMAP
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
#endif`, Yf = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, qf = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, jf = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Kf = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Zf = `#ifdef USE_GRADIENTMAP
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
}`, $f = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Jf = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Qf = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, tp = `uniform bool receiveShadow;
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
#endif`, ep = `#ifdef USE_ENVMAP
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
#endif`, np = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, ip = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, sp = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, rp = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, ap = `PhysicalMaterial material;
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
#endif`, op = `struct PhysicalMaterial {
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
}`, lp = `
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
#endif`, cp = `#if defined( RE_IndirectDiffuse )
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
#endif`, hp = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, up = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, dp = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, fp = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, pp = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, mp = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, gp = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, _p = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, vp = `#if defined( USE_POINTS_UV )
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
#endif`, xp = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, Mp = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, Sp = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, yp = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Ep = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, bp = `#ifdef USE_MORPHTARGETS
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
#endif`, Tp = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, wp = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, Ap = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, Cp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Rp = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Pp = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Dp = `#ifdef USE_NORMALMAP
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
#endif`, Lp = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Ip = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Up = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Np = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, Fp = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, Op = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, Bp = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, kp = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, zp = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Hp = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Gp = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Vp = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Wp = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Xp = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Yp = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, qp = `float getShadowMask() {
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
}`, jp = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Kp = `#ifdef USE_SKINNING
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
#endif`, Zp = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, $p = `#ifdef USE_SKINNING
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
#endif`, Jp = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Qp = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, tm = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, em = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, nm = `#ifdef USE_TRANSMISSION
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
#endif`, im = `#ifdef USE_TRANSMISSION
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
#endif`, sm = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, rm = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, am = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, om = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
  const lm = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, cm = `uniform sampler2D t2D;
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
}`, hm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, um = `#ifdef ENVMAP_TYPE_CUBE
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
}`, dm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, fm = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, pm = `#include <common>
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
}`, mm = `#if DEPTH_PACKING == 3200
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
}`, gm = `#define DISTANCE
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
}`, _m = `#define DISTANCE
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
}`, vm = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, xm = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Mm = `uniform float scale;
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
}`, Sm = `uniform vec3 diffuse;
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
}`, ym = `#include <common>
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
}`, Em = `uniform vec3 diffuse;
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
}`, bm = `#define LAMBERT
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
}`, Tm = `#define LAMBERT
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
}`, wm = `#define MATCAP
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
}`, Am = `#define MATCAP
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
}`, Cm = `#define NORMAL
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
}`, Rm = `#define NORMAL
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
}`, Pm = `#define PHONG
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
}`, Dm = `#define PHONG
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
}`, Lm = `#define STANDARD
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
}`, Im = `#define STANDARD
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
}`, Um = `#define TOON
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
}`, Nm = `#define TOON
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
}`, Fm = `uniform float size;
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
}`, Om = `uniform vec3 diffuse;
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
}`, Bm = `#include <common>
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
}`, km = `uniform vec3 color;
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
}`, zm = `uniform float rotation;
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
}`, Hm = `uniform vec3 diffuse;
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
}`, Nt = {
    alphahash_fragment: cf,
    alphahash_pars_fragment: hf,
    alphamap_fragment: uf,
    alphamap_pars_fragment: df,
    alphatest_fragment: ff,
    alphatest_pars_fragment: pf,
    aomap_fragment: mf,
    aomap_pars_fragment: gf,
    batching_pars_vertex: _f,
    batching_vertex: vf,
    begin_vertex: xf,
    beginnormal_vertex: Mf,
    bsdfs: Sf,
    iridescence_fragment: yf,
    bumpmap_pars_fragment: Ef,
    clipping_planes_fragment: bf,
    clipping_planes_pars_fragment: Tf,
    clipping_planes_pars_vertex: wf,
    clipping_planes_vertex: Af,
    color_fragment: Cf,
    color_pars_fragment: Rf,
    color_pars_vertex: Pf,
    color_vertex: Df,
    common: Lf,
    cube_uv_reflection_fragment: If,
    defaultnormal_vertex: Uf,
    displacementmap_pars_vertex: Nf,
    displacementmap_vertex: Ff,
    emissivemap_fragment: Of,
    emissivemap_pars_fragment: Bf,
    colorspace_fragment: kf,
    colorspace_pars_fragment: zf,
    envmap_fragment: Hf,
    envmap_common_pars_fragment: Gf,
    envmap_pars_fragment: Vf,
    envmap_pars_vertex: Wf,
    envmap_physical_pars_fragment: ep,
    envmap_vertex: Xf,
    fog_vertex: Yf,
    fog_pars_vertex: qf,
    fog_fragment: jf,
    fog_pars_fragment: Kf,
    gradientmap_pars_fragment: Zf,
    lightmap_pars_fragment: $f,
    lights_lambert_fragment: Jf,
    lights_lambert_pars_fragment: Qf,
    lights_pars_begin: tp,
    lights_toon_fragment: np,
    lights_toon_pars_fragment: ip,
    lights_phong_fragment: sp,
    lights_phong_pars_fragment: rp,
    lights_physical_fragment: ap,
    lights_physical_pars_fragment: op,
    lights_fragment_begin: lp,
    lights_fragment_maps: cp,
    lights_fragment_end: hp,
    logdepthbuf_fragment: up,
    logdepthbuf_pars_fragment: dp,
    logdepthbuf_pars_vertex: fp,
    logdepthbuf_vertex: pp,
    map_fragment: mp,
    map_pars_fragment: gp,
    map_particle_fragment: _p,
    map_particle_pars_fragment: vp,
    metalnessmap_fragment: xp,
    metalnessmap_pars_fragment: Mp,
    morphinstance_vertex: Sp,
    morphcolor_vertex: yp,
    morphnormal_vertex: Ep,
    morphtarget_pars_vertex: bp,
    morphtarget_vertex: Tp,
    normal_fragment_begin: wp,
    normal_fragment_maps: Ap,
    normal_pars_fragment: Cp,
    normal_pars_vertex: Rp,
    normal_vertex: Pp,
    normalmap_pars_fragment: Dp,
    clearcoat_normal_fragment_begin: Lp,
    clearcoat_normal_fragment_maps: Ip,
    clearcoat_pars_fragment: Up,
    iridescence_pars_fragment: Np,
    opaque_fragment: Fp,
    packing: Op,
    premultiplied_alpha_fragment: Bp,
    project_vertex: kp,
    dithering_fragment: zp,
    dithering_pars_fragment: Hp,
    roughnessmap_fragment: Gp,
    roughnessmap_pars_fragment: Vp,
    shadowmap_pars_fragment: Wp,
    shadowmap_pars_vertex: Xp,
    shadowmap_vertex: Yp,
    shadowmask_pars_fragment: qp,
    skinbase_vertex: jp,
    skinning_pars_vertex: Kp,
    skinning_vertex: Zp,
    skinnormal_vertex: $p,
    specularmap_fragment: Jp,
    specularmap_pars_fragment: Qp,
    tonemapping_fragment: tm,
    tonemapping_pars_fragment: em,
    transmission_fragment: nm,
    transmission_pars_fragment: im,
    uv_pars_fragment: sm,
    uv_pars_vertex: rm,
    uv_vertex: am,
    worldpos_vertex: om,
    background_vert: lm,
    background_frag: cm,
    backgroundCube_vert: hm,
    backgroundCube_frag: um,
    cube_vert: dm,
    cube_frag: fm,
    depth_vert: pm,
    depth_frag: mm,
    distanceRGBA_vert: gm,
    distanceRGBA_frag: _m,
    equirect_vert: vm,
    equirect_frag: xm,
    linedashed_vert: Mm,
    linedashed_frag: Sm,
    meshbasic_vert: ym,
    meshbasic_frag: Em,
    meshlambert_vert: bm,
    meshlambert_frag: Tm,
    meshmatcap_vert: wm,
    meshmatcap_frag: Am,
    meshnormal_vert: Cm,
    meshnormal_frag: Rm,
    meshphong_vert: Pm,
    meshphong_frag: Dm,
    meshphysical_vert: Lm,
    meshphysical_frag: Im,
    meshtoon_vert: Um,
    meshtoon_frag: Nm,
    points_vert: Fm,
    points_frag: Om,
    shadow_vert: Bm,
    shadow_frag: km,
    sprite_vert: zm,
    sprite_frag: Hm
  }, et = {
    common: {
      diffuse: {
        value: new Et(16777215)
      },
      opacity: {
        value: 1
      },
      map: {
        value: null
      },
      mapTransform: {
        value: new It()
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new It()
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
        value: new It()
      }
    },
    envmap: {
      envMap: {
        value: null
      },
      envMapRotation: {
        value: new It()
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
        value: new It()
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
        value: new It()
      }
    },
    bumpmap: {
      bumpMap: {
        value: null
      },
      bumpMapTransform: {
        value: new It()
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
        value: new It()
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
        value: new It()
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
        value: new It()
      }
    },
    metalnessmap: {
      metalnessMap: {
        value: null
      },
      metalnessMapTransform: {
        value: new It()
      }
    },
    roughnessmap: {
      roughnessMap: {
        value: null
      },
      roughnessMapTransform: {
        value: new It()
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
        value: new Et(16777215)
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
        value: new Et(16777215)
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
        value: new It()
      },
      alphaTest: {
        value: 0
      },
      uvTransform: {
        value: new It()
      }
    },
    sprite: {
      diffuse: {
        value: new Et(16777215)
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
        value: new It()
      },
      alphaMap: {
        value: null
      },
      alphaMapTransform: {
        value: new It()
      },
      alphaTest: {
        value: 0
      }
    }
  }, tn = {
    basic: {
      uniforms: Ae([
        et.common,
        et.specularmap,
        et.envmap,
        et.aomap,
        et.lightmap,
        et.fog
      ]),
      vertexShader: Nt.meshbasic_vert,
      fragmentShader: Nt.meshbasic_frag
    },
    lambert: {
      uniforms: Ae([
        et.common,
        et.specularmap,
        et.envmap,
        et.aomap,
        et.lightmap,
        et.emissivemap,
        et.bumpmap,
        et.normalmap,
        et.displacementmap,
        et.fog,
        et.lights,
        {
          emissive: {
            value: new Et(0)
          }
        }
      ]),
      vertexShader: Nt.meshlambert_vert,
      fragmentShader: Nt.meshlambert_frag
    },
    phong: {
      uniforms: Ae([
        et.common,
        et.specularmap,
        et.envmap,
        et.aomap,
        et.lightmap,
        et.emissivemap,
        et.bumpmap,
        et.normalmap,
        et.displacementmap,
        et.fog,
        et.lights,
        {
          emissive: {
            value: new Et(0)
          },
          specular: {
            value: new Et(1118481)
          },
          shininess: {
            value: 30
          }
        }
      ]),
      vertexShader: Nt.meshphong_vert,
      fragmentShader: Nt.meshphong_frag
    },
    standard: {
      uniforms: Ae([
        et.common,
        et.envmap,
        et.aomap,
        et.lightmap,
        et.emissivemap,
        et.bumpmap,
        et.normalmap,
        et.displacementmap,
        et.roughnessmap,
        et.metalnessmap,
        et.fog,
        et.lights,
        {
          emissive: {
            value: new Et(0)
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
      vertexShader: Nt.meshphysical_vert,
      fragmentShader: Nt.meshphysical_frag
    },
    toon: {
      uniforms: Ae([
        et.common,
        et.aomap,
        et.lightmap,
        et.emissivemap,
        et.bumpmap,
        et.normalmap,
        et.displacementmap,
        et.gradientmap,
        et.fog,
        et.lights,
        {
          emissive: {
            value: new Et(0)
          }
        }
      ]),
      vertexShader: Nt.meshtoon_vert,
      fragmentShader: Nt.meshtoon_frag
    },
    matcap: {
      uniforms: Ae([
        et.common,
        et.bumpmap,
        et.normalmap,
        et.displacementmap,
        et.fog,
        {
          matcap: {
            value: null
          }
        }
      ]),
      vertexShader: Nt.meshmatcap_vert,
      fragmentShader: Nt.meshmatcap_frag
    },
    points: {
      uniforms: Ae([
        et.points,
        et.fog
      ]),
      vertexShader: Nt.points_vert,
      fragmentShader: Nt.points_frag
    },
    dashed: {
      uniforms: Ae([
        et.common,
        et.fog,
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
      vertexShader: Nt.linedashed_vert,
      fragmentShader: Nt.linedashed_frag
    },
    depth: {
      uniforms: Ae([
        et.common,
        et.displacementmap
      ]),
      vertexShader: Nt.depth_vert,
      fragmentShader: Nt.depth_frag
    },
    normal: {
      uniforms: Ae([
        et.common,
        et.bumpmap,
        et.normalmap,
        et.displacementmap,
        {
          opacity: {
            value: 1
          }
        }
      ]),
      vertexShader: Nt.meshnormal_vert,
      fragmentShader: Nt.meshnormal_frag
    },
    sprite: {
      uniforms: Ae([
        et.sprite,
        et.fog
      ]),
      vertexShader: Nt.sprite_vert,
      fragmentShader: Nt.sprite_frag
    },
    background: {
      uniforms: {
        uvTransform: {
          value: new It()
        },
        t2D: {
          value: null
        },
        backgroundIntensity: {
          value: 1
        }
      },
      vertexShader: Nt.background_vert,
      fragmentShader: Nt.background_frag
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
          value: new It()
        }
      },
      vertexShader: Nt.backgroundCube_vert,
      fragmentShader: Nt.backgroundCube_frag
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
      vertexShader: Nt.cube_vert,
      fragmentShader: Nt.cube_frag
    },
    equirect: {
      uniforms: {
        tEquirect: {
          value: null
        }
      },
      vertexShader: Nt.equirect_vert,
      fragmentShader: Nt.equirect_frag
    },
    distanceRGBA: {
      uniforms: Ae([
        et.common,
        et.displacementmap,
        {
          referencePosition: {
            value: new C()
          },
          nearDistance: {
            value: 1
          },
          farDistance: {
            value: 1e3
          }
        }
      ]),
      vertexShader: Nt.distanceRGBA_vert,
      fragmentShader: Nt.distanceRGBA_frag
    },
    shadow: {
      uniforms: Ae([
        et.lights,
        et.fog,
        {
          color: {
            value: new Et(0)
          },
          opacity: {
            value: 1
          }
        }
      ]),
      vertexShader: Nt.shadow_vert,
      fragmentShader: Nt.shadow_frag
    }
  };
  tn.physical = {
    uniforms: Ae([
      tn.standard.uniforms,
      {
        clearcoat: {
          value: 0
        },
        clearcoatMap: {
          value: null
        },
        clearcoatMapTransform: {
          value: new It()
        },
        clearcoatNormalMap: {
          value: null
        },
        clearcoatNormalMapTransform: {
          value: new It()
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
          value: new It()
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
          value: new It()
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
          value: new It()
        },
        sheen: {
          value: 0
        },
        sheenColor: {
          value: new Et(0)
        },
        sheenColorMap: {
          value: null
        },
        sheenColorMapTransform: {
          value: new It()
        },
        sheenRoughness: {
          value: 1
        },
        sheenRoughnessMap: {
          value: null
        },
        sheenRoughnessMapTransform: {
          value: new It()
        },
        transmission: {
          value: 0
        },
        transmissionMap: {
          value: null
        },
        transmissionMapTransform: {
          value: new It()
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
          value: new It()
        },
        attenuationDistance: {
          value: 0
        },
        attenuationColor: {
          value: new Et(0)
        },
        specularColor: {
          value: new Et(1, 1, 1)
        },
        specularColorMap: {
          value: null
        },
        specularColorMapTransform: {
          value: new It()
        },
        specularIntensity: {
          value: 1
        },
        specularIntensityMap: {
          value: null
        },
        specularIntensityMapTransform: {
          value: new It()
        },
        anisotropyVector: {
          value: new _t()
        },
        anisotropyMap: {
          value: null
        },
        anisotropyMapTransform: {
          value: new It()
        }
      }
    ]),
    vertexShader: Nt.meshphysical_vert,
    fragmentShader: Nt.meshphysical_frag
  };
  const Ps = {
    r: 0,
    b: 0,
    g: 0
  }, Vn = new rn(), Gm = new qt();
  function Vm(i, t, e, n, s, r, a) {
    const o = new Et(0);
    let l = r === true ? 0 : 1, c, h, d = null, f = 0, p = null;
    function g(E) {
      let b = E.isScene === true ? E.background : null;
      return b && b.isTexture && (b = (E.backgroundBlurriness > 0 ? e : t).get(b)), b;
    }
    function _(E) {
      let b = false;
      const S = g(E);
      S === null ? u(o, l) : S && S.isColor && (u(S, 1), b = true);
      const N = i.xr.getEnvironmentBlendMode();
      N === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : N === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (i.autoClear || b) && (n.buffers.depth.setTest(true), n.buffers.depth.setMask(true), n.buffers.color.setMask(true), i.clear(i.autoClearColor, i.autoClearDepth, i.autoClearStencil));
    }
    function m(E, b) {
      const S = g(b);
      S && (S.isCubeTexture || S.mapping === or) ? (h === void 0 && (h = new he(new cs(1, 1, 1), new ae({
        name: "BackgroundCubeMaterial",
        uniforms: Ni(tn.backgroundCube.uniforms),
        vertexShader: tn.backgroundCube.vertexShader,
        fragmentShader: tn.backgroundCube.fragmentShader,
        side: Ue,
        depthTest: false,
        depthWrite: false,
        fog: false
      })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(N, w, A) {
        this.matrixWorld.copyPosition(A.matrixWorld);
      }, Object.defineProperty(h.material, "envMap", {
        get: function() {
          return this.uniforms.envMap.value;
        }
      }), s.update(h)), Vn.copy(b.backgroundRotation), Vn.x *= -1, Vn.y *= -1, Vn.z *= -1, S.isCubeTexture && S.isRenderTargetTexture === false && (Vn.y *= -1, Vn.z *= -1), h.material.uniforms.envMap.value = S, h.material.uniforms.flipEnvMap.value = S.isCubeTexture && S.isRenderTargetTexture === false ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = b.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = b.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Gm.makeRotationFromEuler(Vn)), h.material.toneMapped = Vt.getTransfer(S.colorSpace) !== $t, (d !== S || f !== S.version || p !== i.toneMapping) && (h.material.needsUpdate = true, d = S, f = S.version, p = i.toneMapping), h.layers.enableAll(), E.unshift(h, h.geometry, h.material, 0, 0, null)) : S && S.isTexture && (c === void 0 && (c = new he(new Mn(2, 2), new ae({
        name: "BackgroundMaterial",
        uniforms: Ni(tn.background.uniforms),
        vertexShader: tn.background.vertexShader,
        fragmentShader: tn.background.fragmentShader,
        side: Fn,
        depthTest: false,
        depthWrite: false,
        fog: false
      })), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
        get: function() {
          return this.uniforms.t2D.value;
        }
      }), s.update(c)), c.material.uniforms.t2D.value = S, c.material.uniforms.backgroundIntensity.value = b.backgroundIntensity, c.material.toneMapped = Vt.getTransfer(S.colorSpace) !== $t, S.matrixAutoUpdate === true && S.updateMatrix(), c.material.uniforms.uvTransform.value.copy(S.matrix), (d !== S || f !== S.version || p !== i.toneMapping) && (c.material.needsUpdate = true, d = S, f = S.version, p = i.toneMapping), c.layers.enableAll(), E.unshift(c, c.geometry, c.material, 0, 0, null));
    }
    function u(E, b) {
      E.getRGB(Ps, ah(i)), n.buffers.color.setClear(Ps.r, Ps.g, Ps.b, b, a);
    }
    return {
      getClearColor: function() {
        return o;
      },
      setClearColor: function(E, b = 1) {
        o.set(E), l = b, u(o, l);
      },
      getClearAlpha: function() {
        return l;
      },
      setClearAlpha: function(E) {
        l = E, u(o, l);
      },
      render: _,
      addToRenderList: m
    };
  }
  function Wm(i, t) {
    const e = i.getParameter(i.MAX_VERTEX_ATTRIBS), n = {}, s = f(null);
    let r = s, a = false;
    function o(x, R, G, k, X) {
      let Z = false;
      const V = d(k, G, R);
      r !== V && (r = V, c(r.object)), Z = p(x, k, G, X), Z && g(x, k, G, X), X !== null && t.update(X, i.ELEMENT_ARRAY_BUFFER), (Z || a) && (a = false, S(x, R, G, k), X !== null && i.bindBuffer(i.ELEMENT_ARRAY_BUFFER, t.get(X).buffer));
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
    function d(x, R, G) {
      const k = G.wireframe === true;
      let X = n[x.id];
      X === void 0 && (X = {}, n[x.id] = X);
      let Z = X[R.id];
      Z === void 0 && (Z = {}, X[R.id] = Z);
      let V = Z[k];
      return V === void 0 && (V = f(l()), Z[k] = V), V;
    }
    function f(x) {
      const R = [], G = [], k = [];
      for (let X = 0; X < e; X++) R[X] = 0, G[X] = 0, k[X] = 0;
      return {
        geometry: null,
        program: null,
        wireframe: false,
        newAttributes: R,
        enabledAttributes: G,
        attributeDivisors: k,
        object: x,
        attributes: {},
        index: null
      };
    }
    function p(x, R, G, k) {
      const X = r.attributes, Z = R.attributes;
      let V = 0;
      const Q = G.getAttributes();
      for (const H in Q) if (Q[H].location >= 0) {
        const ht = X[H];
        let St = Z[H];
        if (St === void 0 && (H === "instanceMatrix" && x.instanceMatrix && (St = x.instanceMatrix), H === "instanceColor" && x.instanceColor && (St = x.instanceColor)), ht === void 0 || ht.attribute !== St || St && ht.data !== St.data) return true;
        V++;
      }
      return r.attributesNum !== V || r.index !== k;
    }
    function g(x, R, G, k) {
      const X = {}, Z = R.attributes;
      let V = 0;
      const Q = G.getAttributes();
      for (const H in Q) if (Q[H].location >= 0) {
        let ht = Z[H];
        ht === void 0 && (H === "instanceMatrix" && x.instanceMatrix && (ht = x.instanceMatrix), H === "instanceColor" && x.instanceColor && (ht = x.instanceColor));
        const St = {};
        St.attribute = ht, ht && ht.data && (St.data = ht.data), X[H] = St, V++;
      }
      r.attributes = X, r.attributesNum = V, r.index = k;
    }
    function _() {
      const x = r.newAttributes;
      for (let R = 0, G = x.length; R < G; R++) x[R] = 0;
    }
    function m(x) {
      u(x, 0);
    }
    function u(x, R) {
      const G = r.newAttributes, k = r.enabledAttributes, X = r.attributeDivisors;
      G[x] = 1, k[x] === 0 && (i.enableVertexAttribArray(x), k[x] = 1), X[x] !== R && (i.vertexAttribDivisor(x, R), X[x] = R);
    }
    function E() {
      const x = r.newAttributes, R = r.enabledAttributes;
      for (let G = 0, k = R.length; G < k; G++) R[G] !== x[G] && (i.disableVertexAttribArray(G), R[G] = 0);
    }
    function b(x, R, G, k, X, Z, V) {
      V === true ? i.vertexAttribIPointer(x, R, G, X, Z) : i.vertexAttribPointer(x, R, G, k, X, Z);
    }
    function S(x, R, G, k) {
      _();
      const X = k.attributes, Z = G.getAttributes(), V = R.defaultAttributeValues;
      for (const Q in Z) {
        const H = Z[Q];
        if (H.location >= 0) {
          let st = X[Q];
          if (st === void 0 && (Q === "instanceMatrix" && x.instanceMatrix && (st = x.instanceMatrix), Q === "instanceColor" && x.instanceColor && (st = x.instanceColor)), st !== void 0) {
            const ht = st.normalized, St = st.itemSize, Ft = t.get(st);
            if (Ft === void 0) continue;
            const te = Ft.buffer, Y = Ft.type, tt = Ft.bytesPerElement, vt = Y === i.INT || Y === i.UNSIGNED_INT || st.gpuType === no;
            if (st.isInterleavedBufferAttribute) {
              const rt = st.data, wt = rt.stride, Rt = st.offset;
              if (rt.isInstancedInterleavedBuffer) {
                for (let Ot = 0; Ot < H.locationSize; Ot++) u(H.location + Ot, rt.meshPerAttribute);
                x.isInstancedMesh !== true && k._maxInstanceCount === void 0 && (k._maxInstanceCount = rt.meshPerAttribute * rt.count);
              } else for (let Ot = 0; Ot < H.locationSize; Ot++) m(H.location + Ot);
              i.bindBuffer(i.ARRAY_BUFFER, te);
              for (let Ot = 0; Ot < H.locationSize; Ot++) b(H.location + Ot, St / H.locationSize, Y, ht, wt * tt, (Rt + St / H.locationSize * Ot) * tt, vt);
            } else {
              if (st.isInstancedBufferAttribute) {
                for (let rt = 0; rt < H.locationSize; rt++) u(H.location + rt, st.meshPerAttribute);
                x.isInstancedMesh !== true && k._maxInstanceCount === void 0 && (k._maxInstanceCount = st.meshPerAttribute * st.count);
              } else for (let rt = 0; rt < H.locationSize; rt++) m(H.location + rt);
              i.bindBuffer(i.ARRAY_BUFFER, te);
              for (let rt = 0; rt < H.locationSize; rt++) b(H.location + rt, St / H.locationSize, Y, ht, St * tt, St / H.locationSize * rt * tt, vt);
            }
          } else if (V !== void 0) {
            const ht = V[Q];
            if (ht !== void 0) switch (ht.length) {
              case 2:
                i.vertexAttrib2fv(H.location, ht);
                break;
              case 3:
                i.vertexAttrib3fv(H.location, ht);
                break;
              case 4:
                i.vertexAttrib4fv(H.location, ht);
                break;
              default:
                i.vertexAttrib1fv(H.location, ht);
            }
          }
        }
      }
      E();
    }
    function N() {
      P();
      for (const x in n) {
        const R = n[x];
        for (const G in R) {
          const k = R[G];
          for (const X in k) h(k[X].object), delete k[X];
          delete R[G];
        }
        delete n[x];
      }
    }
    function w(x) {
      if (n[x.id] === void 0) return;
      const R = n[x.id];
      for (const G in R) {
        const k = R[G];
        for (const X in k) h(k[X].object), delete k[X];
        delete R[G];
      }
      delete n[x.id];
    }
    function A(x) {
      for (const R in n) {
        const G = n[R];
        if (G[x.id] === void 0) continue;
        const k = G[x.id];
        for (const X in k) h(k[X].object), delete k[X];
        delete G[x.id];
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
      releaseStatesOfGeometry: w,
      releaseStatesOfProgram: A,
      initAttributes: _,
      enableAttribute: m,
      disableUnusedAttributes: E
    };
  }
  function Xm(i, t, e) {
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
        for (let _ = 0; _ < d; _++) g += h[_] * f[_];
        e.update(g, n, 1);
      }
    }
    this.setMode = s, this.render = r, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
  }
  function Ym(i, t, e, n) {
    let s;
    function r() {
      if (s !== void 0) return s;
      if (t.has("EXT_texture_filter_anisotropic") === true) {
        const A = t.get("EXT_texture_filter_anisotropic");
        s = i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
      } else s = 0;
      return s;
    }
    function a(A) {
      return !(A !== $e && n.convert(A) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT));
    }
    function o(A) {
      const P = A === vn && (t.has("EXT_color_buffer_half_float") || t.has("EXT_color_buffer_float"));
      return !(A !== Sn && n.convert(A) !== i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE) && A !== nn && !P);
    }
    function l(A) {
      if (A === "highp") {
        if (i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.HIGH_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.HIGH_FLOAT).precision > 0) return "highp";
        A = "mediump";
      }
      return A === "mediump" && i.getShaderPrecisionFormat(i.VERTEX_SHADER, i.MEDIUM_FLOAT).precision > 0 && i.getShaderPrecisionFormat(i.FRAGMENT_SHADER, i.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
    }
    let c = e.precision !== void 0 ? e.precision : "highp";
    const h = l(c);
    h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
    const d = e.logarithmicDepthBuffer === true, f = e.reverseDepthBuffer === true && t.has("EXT_clip_control"), p = i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS), g = i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = i.getParameter(i.MAX_TEXTURE_SIZE), m = i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE), u = i.getParameter(i.MAX_VERTEX_ATTRIBS), E = i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS), b = i.getParameter(i.MAX_VARYING_VECTORS), S = i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS), N = g > 0, w = i.getParameter(i.MAX_SAMPLES);
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
      maxTextureSize: _,
      maxCubemapSize: m,
      maxAttributes: u,
      maxVertexUniforms: E,
      maxVaryings: b,
      maxFragmentUniforms: S,
      vertexTextures: N,
      maxSamples: w
    };
  }
  function qm(i) {
    const t = this;
    let e = null, n = 0, s = false, r = false;
    const a = new Ln(), o = new It(), l = {
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
      const g = d.clippingPlanes, _ = d.clipIntersection, m = d.clipShadows, u = i.get(d);
      if (!s || g === null || g.length === 0 || r && !m) r ? h(null) : c();
      else {
        const E = r ? 0 : n, b = E * 4;
        let S = u.clippingState || null;
        l.value = S, S = h(g, f, b, p);
        for (let N = 0; N !== b; ++N) S[N] = e[N];
        u.clippingState = S, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += E;
      }
    };
    function c() {
      l.value !== e && (l.value = e, l.needsUpdate = n > 0), t.numPlanes = n, t.numIntersection = 0;
    }
    function h(d, f, p, g) {
      const _ = d !== null ? d.length : 0;
      let m = null;
      if (_ !== 0) {
        if (m = l.value, g !== true || m === null) {
          const u = p + _ * 4, E = f.matrixWorldInverse;
          o.getNormalMatrix(E), (m === null || m.length < u) && (m = new Float32Array(u));
          for (let b = 0, S = p; b !== _; ++b, S += 4) a.copy(d[b]).applyMatrix4(E, o), a.normal.toArray(m, S), m[S + 3] = a.constant;
        }
        l.value = m, l.needsUpdate = true;
      }
      return t.numPlanes = _, t.numIntersection = 0, m;
    }
  }
  function jm(i) {
    let t = /* @__PURE__ */ new WeakMap();
    function e(a, o) {
      return o === ua ? a.mapping = Pi : o === da && (a.mapping = Di), a;
    }
    function n(a) {
      if (a && a.isTexture) {
        const o = a.mapping;
        if (o === ua || o === da) if (t.has(a)) {
          const l = t.get(a).texture;
          return e(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new rf(l.height);
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
  class hh extends oh {
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
  const Ei = 4, gl = [
    0.125,
    0.215,
    0.35,
    0.446,
    0.526,
    0.582
  ], jn = 20, Or = new hh(), _l = new Et();
  let Br = null, kr = 0, zr = 0, Hr = false;
  const Yn = (1 + Math.sqrt(5)) / 2, xi = 1 / Yn, vl = [
    new C(-Yn, xi, 0),
    new C(Yn, xi, 0),
    new C(-xi, 0, Yn),
    new C(xi, 0, Yn),
    new C(0, Yn, -xi),
    new C(0, Yn, xi),
    new C(-1, 1, -1),
    new C(1, 1, -1),
    new C(-1, 1, 1),
    new C(1, 1, 1)
  ];
  class xl {
    constructor(t) {
      this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
    }
    fromScene(t, e = 0, n = 0.1, s = 100) {
      Br = this._renderer.getRenderTarget(), kr = this._renderer.getActiveCubeFace(), zr = this._renderer.getActiveMipmapLevel(), Hr = this._renderer.xr.enabled, this._renderer.xr.enabled = false, this._setSize(256);
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
      this._cubemapMaterial === null && (this._cubemapMaterial = yl(), this._compileMaterial(this._cubemapMaterial));
    }
    compileEquirectangularShader() {
      this._equirectMaterial === null && (this._equirectMaterial = Sl(), this._compileMaterial(this._equirectMaterial));
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
      this._renderer.setRenderTarget(Br, kr, zr), this._renderer.xr.enabled = Hr, t.scissorTest = false, Ds(t, 0, 0, t.width, t.height);
    }
    _fromTexture(t, e) {
      t.mapping === Pi || t.mapping === Di ? this._setSize(t.image.length === 0 ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), Br = this._renderer.getRenderTarget(), kr = this._renderer.getActiveCubeFace(), zr = this._renderer.getActiveMipmapLevel(), Hr = this._renderer.xr.enabled, this._renderer.xr.enabled = false;
      const n = e || this._allocateTargets();
      return this._textureToCubeUV(t, n), this._applyPMREM(n), this._cleanup(n), n;
    }
    _allocateTargets() {
      const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, n = {
        magFilter: en,
        minFilter: en,
        generateMipmaps: false,
        type: vn,
        format: $e,
        colorSpace: Bi,
        depthBuffer: false
      }, s = Ml(t, e, n);
      if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
        this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Ml(t, e, n);
        const { _lodMax: r } = this;
        ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Km(r)), this._blurMaterial = Zm(r, t, e);
      }
      return s;
    }
    _compileMaterial(t) {
      const e = new he(this._lodPlanes[0], t);
      this._renderer.compile(e, Or);
    }
    _sceneToCubeUV(t, e, n, s) {
      const o = new Ie(90, 1, e, n), l = [
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
      h.getClearColor(_l), h.toneMapping = Un, h.autoClear = false;
      const p = new Ui({
        name: "PMREM.Background",
        side: Ue,
        depthWrite: false,
        depthTest: false
      }), g = new he(new cs(), p);
      let _ = false;
      const m = t.background;
      m ? m.isColor && (p.color.copy(m), t.background = null, _ = true) : (p.color.copy(_l), _ = true);
      for (let u = 0; u < 6; u++) {
        const E = u % 3;
        E === 0 ? (o.up.set(0, l[u], 0), o.lookAt(c[u], 0, 0)) : E === 1 ? (o.up.set(0, 0, l[u]), o.lookAt(0, c[u], 0)) : (o.up.set(0, l[u], 0), o.lookAt(0, 0, c[u]));
        const b = this._cubeSize;
        Ds(s, E * b, u > 2 ? b : 0, b, b), h.setRenderTarget(s), _ && h.render(g, o), h.render(t, o);
      }
      g.geometry.dispose(), g.material.dispose(), h.toneMapping = f, h.autoClear = d, t.background = m;
    }
    _textureToCubeUV(t, e) {
      const n = this._renderer, s = t.mapping === Pi || t.mapping === Di;
      s ? (this._cubemapMaterial === null && (this._cubemapMaterial = yl()), this._cubemapMaterial.uniforms.flipEnvMap.value = t.isRenderTargetTexture === false ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Sl());
      const r = s ? this._cubemapMaterial : this._equirectMaterial, a = new he(this._lodPlanes[0], r), o = r.uniforms;
      o.envMap.value = t;
      const l = this._cubeSize;
      Ds(e, 0, 0, 3 * l, 2 * l), n.setRenderTarget(e), n.render(a, Or);
    }
    _applyPMREM(t) {
      const e = this._renderer, n = e.autoClear;
      e.autoClear = false;
      const s = this._lodPlanes.length;
      for (let r = 1; r < s; r++) {
        const a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), o = vl[(s - r - 1) % vl.length];
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
      const h = 3, d = new he(this._lodPlanes[s], c), f = c.uniforms, p = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * p) : 2 * Math.PI / (2 * jn - 1), _ = r / g, m = isFinite(r) ? 1 + Math.floor(h * _) : jn;
      m > jn && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${jn}`);
      const u = [];
      let E = 0;
      for (let A = 0; A < jn; ++A) {
        const P = A / _, y = Math.exp(-P * P / 2);
        u.push(y), A === 0 ? E += y : A < m && (E += 2 * y);
      }
      for (let A = 0; A < u.length; A++) u[A] = u[A] / E;
      f.envMap.value = t.texture, f.samples.value = m, f.weights.value = u, f.latitudinal.value = a === "latitudinal", o && (f.poleAxis.value = o);
      const { _lodMax: b } = this;
      f.dTheta.value = g, f.mipInt.value = b - n;
      const S = this._sizeLods[s], N = 3 * S * (s > b - Ei ? s - b + Ei : 0), w = 4 * (this._cubeSize - S);
      Ds(e, N, w, 3 * S, 2 * S), l.setRenderTarget(e), l.render(d, Or);
    }
  }
  function Km(i) {
    const t = [], e = [], n = [];
    let s = i;
    const r = i - Ei + 1 + gl.length;
    for (let a = 0; a < r; a++) {
      const o = Math.pow(2, s);
      e.push(o);
      let l = 1 / o;
      a > i - Ei ? l = gl[a - i + Ei - 1] : a === 0 && (l = 0), n.push(l);
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
      ], p = 6, g = 6, _ = 3, m = 2, u = 1, E = new Float32Array(_ * g * p), b = new Float32Array(m * g * p), S = new Float32Array(u * g * p);
      for (let w = 0; w < p; w++) {
        const A = w % 3 * 2 / 3 - 1, P = w > 2 ? 0 : -1, y = [
          A,
          P,
          0,
          A + 2 / 3,
          P,
          0,
          A + 2 / 3,
          P + 1,
          0,
          A,
          P,
          0,
          A + 2 / 3,
          P + 1,
          0,
          A,
          P + 1,
          0
        ];
        E.set(y, _ * g * w), b.set(f, m * g * w);
        const x = [
          w,
          w,
          w,
          w,
          w,
          w
        ];
        S.set(x, u * g * w);
      }
      const N = new Me();
      N.setAttribute("position", new xe(E, _)), N.setAttribute("uv", new xe(b, m)), N.setAttribute("faceIndex", new xe(S, u)), t.push(N), s > Ei && s--;
    }
    return {
      lodPlanes: t,
      sizeLods: e,
      sigmas: n
    };
  }
  function Ml(i, t, e) {
    const n = new Je(i, t, e);
    return n.texture.mapping = or, n.texture.name = "PMREM.cubeUv", n.scissorTest = true, n;
  }
  function Ds(i, t, e, n, s) {
    i.viewport.set(t, e, n, s), i.scissor.set(t, e, n, s);
  }
  function Zm(i, t, e) {
    const n = new Float32Array(jn), s = new C(0, 1, 0);
    return new ae({
      name: "SphericalGaussianBlur",
      defines: {
        n: jn,
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
      vertexShader: fo(),
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
      blending: _n,
      depthTest: false,
      depthWrite: false
    });
  }
  function Sl() {
    return new ae({
      name: "EquirectangularToCubeUV",
      uniforms: {
        envMap: {
          value: null
        }
      },
      vertexShader: fo(),
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
      blending: _n,
      depthTest: false,
      depthWrite: false
    });
  }
  function yl() {
    return new ae({
      name: "CubemapToCubeUV",
      uniforms: {
        envMap: {
          value: null
        },
        flipEnvMap: {
          value: -1
        }
      },
      vertexShader: fo(),
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
      blending: _n,
      depthTest: false,
      depthWrite: false
    });
  }
  function fo() {
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
  function $m(i) {
    let t = /* @__PURE__ */ new WeakMap(), e = null;
    function n(o) {
      if (o && o.isTexture) {
        const l = o.mapping, c = l === ua || l === da, h = l === Pi || l === Di;
        if (c || h) {
          let d = t.get(o);
          const f = d !== void 0 ? d.texture.pmremVersion : 0;
          if (o.isRenderTargetTexture && o.pmremVersion !== f) return e === null && (e = new xl(i)), d = c ? e.fromEquirectangular(o, d) : e.fromCubemap(o, d), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), d.texture;
          if (d !== void 0) return d.texture;
          {
            const p = o.image;
            return c && p && p.height > 0 || h && p && s(p) ? (e === null && (e = new xl(i)), d = c ? e.fromEquirectangular(o) : e.fromCubemap(o), d.texture.pmremVersion = o.pmremVersion, t.set(o, d), o.addEventListener("dispose", r), d.texture) : null;
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
  function Jm(i) {
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
        return s === null && ts("THREE.WebGLRenderer: " + n + " extension not supported."), s;
      }
    };
  }
  function Qm(i, t, e, n) {
    const s = {}, r = /* @__PURE__ */ new WeakMap();
    function a(d) {
      const f = d.target;
      f.index !== null && t.remove(f.index);
      for (const g in f.attributes) t.remove(f.attributes[g]);
      for (const g in f.morphAttributes) {
        const _ = f.morphAttributes[g];
        for (let m = 0, u = _.length; m < u; m++) t.remove(_[m]);
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
        const _ = p[g];
        for (let m = 0, u = _.length; m < u; m++) t.update(_[m], i.ARRAY_BUFFER);
      }
    }
    function c(d) {
      const f = [], p = d.index, g = d.attributes.position;
      let _ = 0;
      if (p !== null) {
        const E = p.array;
        _ = p.version;
        for (let b = 0, S = E.length; b < S; b += 3) {
          const N = E[b + 0], w = E[b + 1], A = E[b + 2];
          f.push(N, w, w, A, A, N);
        }
      } else if (g !== void 0) {
        const E = g.array;
        _ = g.version;
        for (let b = 0, S = E.length / 3 - 1; b < S; b += 3) {
          const N = b + 0, w = b + 1, A = b + 2;
          f.push(N, w, w, A, A, N);
        }
      } else return;
      const m = new (th(f) ? rh : sh)(f, 1);
      m.version = _;
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
  function tg(i, t, e) {
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
    function d(f, p, g, _) {
      if (g === 0) return;
      const m = t.get("WEBGL_multi_draw");
      if (m === null) for (let u = 0; u < f.length; u++) c(f[u] / a, p[u], _[u]);
      else {
        m.multiDrawElementsInstancedWEBGL(n, p, 0, r, f, 0, _, 0, g);
        let u = 0;
        for (let E = 0; E < g; E++) u += p[E] * _[E];
        e.update(u, n, 1);
      }
    }
    this.setMode = s, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = d;
  }
  function eg(i) {
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
  function ng(i, t, e) {
    const n = /* @__PURE__ */ new WeakMap(), s = new Qt();
    function r(a, o, l) {
      const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, d = h !== void 0 ? h.length : 0;
      let f = n.get(o);
      if (f === void 0 || f.count !== d) {
        let y = function() {
          A.dispose(), n.delete(o), o.removeEventListener("dispose", y);
        };
        f !== void 0 && f.texture.dispose();
        const p = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, _ = o.morphAttributes.color !== void 0, m = o.morphAttributes.position || [], u = o.morphAttributes.normal || [], E = o.morphAttributes.color || [];
        let b = 0;
        p === true && (b = 1), g === true && (b = 2), _ === true && (b = 3);
        let S = o.attributes.position.count * b, N = 1;
        S > t.maxTextureSize && (N = Math.ceil(S / t.maxTextureSize), S = t.maxTextureSize);
        const w = new Float32Array(S * N * 4 * d), A = new nh(w, S, N, d);
        A.type = nn, A.needsUpdate = true;
        const P = b * 4;
        for (let x = 0; x < d; x++) {
          const R = m[x], G = u[x], k = E[x], X = S * N * 4 * x;
          for (let Z = 0; Z < R.count; Z++) {
            const V = Z * P;
            p === true && (s.fromBufferAttribute(R, Z), w[X + V + 0] = s.x, w[X + V + 1] = s.y, w[X + V + 2] = s.z, w[X + V + 3] = 0), g === true && (s.fromBufferAttribute(G, Z), w[X + V + 4] = s.x, w[X + V + 5] = s.y, w[X + V + 6] = s.z, w[X + V + 7] = 0), _ === true && (s.fromBufferAttribute(k, Z), w[X + V + 8] = s.x, w[X + V + 9] = s.y, w[X + V + 10] = s.z, w[X + V + 11] = k.itemSize === 4 ? s.w : 1);
          }
        }
        f = {
          count: d,
          texture: A,
          size: new _t(S, N)
        }, n.set(o, f), o.addEventListener("dispose", y);
      }
      if (a.isInstancedMesh === true && a.morphTexture !== null) l.getUniforms().setValue(i, "morphTexture", a.morphTexture, e);
      else {
        let p = 0;
        for (let _ = 0; _ < c.length; _++) p += c[_];
        const g = o.morphTargetsRelative ? 1 : 1 - p;
        l.getUniforms().setValue(i, "morphTargetBaseInfluence", g), l.getUniforms().setValue(i, "morphTargetInfluences", c);
      }
      l.getUniforms().setValue(i, "morphTargetsTexture", f.texture, e), l.getUniforms().setValue(i, "morphTargetsTextureSize", f.size);
    }
    return {
      update: r
    };
  }
  function ig(i, t, e, n) {
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
  class uh extends Re {
    constructor(t, e, n, s, r, a, o, l, c, h = Ai) {
      if (h !== Ai && h !== Ii) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
      n === void 0 && h === Ai && (n = Jn), n === void 0 && h === Ii && (n = Li), super(null, s, r, a, o, l, h, n, c), this.isDepthTexture = true, this.image = {
        width: t,
        height: e
      }, this.magFilter = o !== void 0 ? o : ke, this.minFilter = l !== void 0 ? l : ke, this.flipY = false, this.generateMipmaps = false, this.compareFunction = null;
    }
    copy(t) {
      return super.copy(t), this.compareFunction = t.compareFunction, this;
    }
    toJSON(t) {
      const e = super.toJSON(t);
      return this.compareFunction !== null && (e.compareFunction = this.compareFunction), e;
    }
  }
  const dh = new Re(), El = new uh(1, 1), fh = new nh(), ph = new Vd(), mh = new lh(), bl = [], Tl = [], wl = new Float32Array(16), Al = new Float32Array(9), Cl = new Float32Array(4);
  function zi(i, t, e) {
    const n = i[0];
    if (n <= 0 || n > 0) return i;
    const s = t * e;
    let r = bl[s];
    if (r === void 0 && (r = new Float32Array(s), bl[s] = r), t !== 0) {
      n.toArray(r, 0);
      for (let a = 1, o = 0; a !== t; ++a) o += e, i[a].toArray(r, o);
    }
    return r;
  }
  function ge(i, t) {
    if (i.length !== t.length) return false;
    for (let e = 0, n = i.length; e < n; e++) if (i[e] !== t[e]) return false;
    return true;
  }
  function _e(i, t) {
    for (let e = 0, n = t.length; e < n; e++) i[e] = t[e];
  }
  function cr(i, t) {
    let e = Tl[t];
    e === void 0 && (e = new Int32Array(t), Tl[t] = e);
    for (let n = 0; n !== t; ++n) e[n] = i.allocateTextureUnit();
    return e;
  }
  function sg(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1f(this.addr, t), e[0] = t);
  }
  function rg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (i.uniform2f(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
      if (ge(e, t)) return;
      i.uniform2fv(this.addr, t), _e(e, t);
    }
  }
  function ag(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3f(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else if (t.r !== void 0) (e[0] !== t.r || e[1] !== t.g || e[2] !== t.b) && (i.uniform3f(this.addr, t.r, t.g, t.b), e[0] = t.r, e[1] = t.g, e[2] = t.b);
    else {
      if (ge(e, t)) return;
      i.uniform3fv(this.addr, t), _e(e, t);
    }
  }
  function og(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4f(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
      if (ge(e, t)) return;
      i.uniform4fv(this.addr, t), _e(e, t);
    }
  }
  function lg(i, t) {
    const e = this.cache, n = t.elements;
    if (n === void 0) {
      if (ge(e, t)) return;
      i.uniformMatrix2fv(this.addr, false, t), _e(e, t);
    } else {
      if (ge(e, n)) return;
      Cl.set(n), i.uniformMatrix2fv(this.addr, false, Cl), _e(e, n);
    }
  }
  function cg(i, t) {
    const e = this.cache, n = t.elements;
    if (n === void 0) {
      if (ge(e, t)) return;
      i.uniformMatrix3fv(this.addr, false, t), _e(e, t);
    } else {
      if (ge(e, n)) return;
      Al.set(n), i.uniformMatrix3fv(this.addr, false, Al), _e(e, n);
    }
  }
  function hg(i, t) {
    const e = this.cache, n = t.elements;
    if (n === void 0) {
      if (ge(e, t)) return;
      i.uniformMatrix4fv(this.addr, false, t), _e(e, t);
    } else {
      if (ge(e, n)) return;
      wl.set(n), i.uniformMatrix4fv(this.addr, false, wl), _e(e, n);
    }
  }
  function ug(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1i(this.addr, t), e[0] = t);
  }
  function dg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (i.uniform2i(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
      if (ge(e, t)) return;
      i.uniform2iv(this.addr, t), _e(e, t);
    }
  }
  function fg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3i(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else {
      if (ge(e, t)) return;
      i.uniform3iv(this.addr, t), _e(e, t);
    }
  }
  function pg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4i(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
      if (ge(e, t)) return;
      i.uniform4iv(this.addr, t), _e(e, t);
    }
  }
  function mg(i, t) {
    const e = this.cache;
    e[0] !== t && (i.uniform1ui(this.addr, t), e[0] = t);
  }
  function gg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y) && (i.uniform2ui(this.addr, t.x, t.y), e[0] = t.x, e[1] = t.y);
    else {
      if (ge(e, t)) return;
      i.uniform2uiv(this.addr, t), _e(e, t);
    }
  }
  function _g(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z) && (i.uniform3ui(this.addr, t.x, t.y, t.z), e[0] = t.x, e[1] = t.y, e[2] = t.z);
    else {
      if (ge(e, t)) return;
      i.uniform3uiv(this.addr, t), _e(e, t);
    }
  }
  function vg(i, t) {
    const e = this.cache;
    if (t.x !== void 0) (e[0] !== t.x || e[1] !== t.y || e[2] !== t.z || e[3] !== t.w) && (i.uniform4ui(this.addr, t.x, t.y, t.z, t.w), e[0] = t.x, e[1] = t.y, e[2] = t.z, e[3] = t.w);
    else {
      if (ge(e, t)) return;
      i.uniform4uiv(this.addr, t), _e(e, t);
    }
  }
  function xg(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s);
    let r;
    this.type === i.SAMPLER_2D_SHADOW ? (El.compareFunction = Jc, r = El) : r = dh, e.setTexture2D(t || r, s);
  }
  function Mg(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture3D(t || ph, s);
  }
  function Sg(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTextureCube(t || mh, s);
  }
  function yg(i, t, e) {
    const n = this.cache, s = e.allocateTextureUnit();
    n[0] !== s && (i.uniform1i(this.addr, s), n[0] = s), e.setTexture2DArray(t || fh, s);
  }
  function Eg(i) {
    switch (i) {
      case 5126:
        return sg;
      case 35664:
        return rg;
      case 35665:
        return ag;
      case 35666:
        return og;
      case 35674:
        return lg;
      case 35675:
        return cg;
      case 35676:
        return hg;
      case 5124:
      case 35670:
        return ug;
      case 35667:
      case 35671:
        return dg;
      case 35668:
      case 35672:
        return fg;
      case 35669:
      case 35673:
        return pg;
      case 5125:
        return mg;
      case 36294:
        return gg;
      case 36295:
        return _g;
      case 36296:
        return vg;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return xg;
      case 35679:
      case 36299:
      case 36307:
        return Mg;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return Sg;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return yg;
    }
  }
  function bg(i, t) {
    i.uniform1fv(this.addr, t);
  }
  function Tg(i, t) {
    const e = zi(t, this.size, 2);
    i.uniform2fv(this.addr, e);
  }
  function wg(i, t) {
    const e = zi(t, this.size, 3);
    i.uniform3fv(this.addr, e);
  }
  function Ag(i, t) {
    const e = zi(t, this.size, 4);
    i.uniform4fv(this.addr, e);
  }
  function Cg(i, t) {
    const e = zi(t, this.size, 4);
    i.uniformMatrix2fv(this.addr, false, e);
  }
  function Rg(i, t) {
    const e = zi(t, this.size, 9);
    i.uniformMatrix3fv(this.addr, false, e);
  }
  function Pg(i, t) {
    const e = zi(t, this.size, 16);
    i.uniformMatrix4fv(this.addr, false, e);
  }
  function Dg(i, t) {
    i.uniform1iv(this.addr, t);
  }
  function Lg(i, t) {
    i.uniform2iv(this.addr, t);
  }
  function Ig(i, t) {
    i.uniform3iv(this.addr, t);
  }
  function Ug(i, t) {
    i.uniform4iv(this.addr, t);
  }
  function Ng(i, t) {
    i.uniform1uiv(this.addr, t);
  }
  function Fg(i, t) {
    i.uniform2uiv(this.addr, t);
  }
  function Og(i, t) {
    i.uniform3uiv(this.addr, t);
  }
  function Bg(i, t) {
    i.uniform4uiv(this.addr, t);
  }
  function kg(i, t, e) {
    const n = this.cache, s = t.length, r = cr(e, s);
    ge(n, r) || (i.uniform1iv(this.addr, r), _e(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture2D(t[a] || dh, r[a]);
  }
  function zg(i, t, e) {
    const n = this.cache, s = t.length, r = cr(e, s);
    ge(n, r) || (i.uniform1iv(this.addr, r), _e(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture3D(t[a] || ph, r[a]);
  }
  function Hg(i, t, e) {
    const n = this.cache, s = t.length, r = cr(e, s);
    ge(n, r) || (i.uniform1iv(this.addr, r), _e(n, r));
    for (let a = 0; a !== s; ++a) e.setTextureCube(t[a] || mh, r[a]);
  }
  function Gg(i, t, e) {
    const n = this.cache, s = t.length, r = cr(e, s);
    ge(n, r) || (i.uniform1iv(this.addr, r), _e(n, r));
    for (let a = 0; a !== s; ++a) e.setTexture2DArray(t[a] || fh, r[a]);
  }
  function Vg(i) {
    switch (i) {
      case 5126:
        return bg;
      case 35664:
        return Tg;
      case 35665:
        return wg;
      case 35666:
        return Ag;
      case 35674:
        return Cg;
      case 35675:
        return Rg;
      case 35676:
        return Pg;
      case 5124:
      case 35670:
        return Dg;
      case 35667:
      case 35671:
        return Lg;
      case 35668:
      case 35672:
        return Ig;
      case 35669:
      case 35673:
        return Ug;
      case 5125:
        return Ng;
      case 36294:
        return Fg;
      case 36295:
        return Og;
      case 36296:
        return Bg;
      case 35678:
      case 36198:
      case 36298:
      case 36306:
      case 35682:
        return kg;
      case 35679:
      case 36299:
      case 36307:
        return zg;
      case 35680:
      case 36300:
      case 36308:
      case 36293:
        return Hg;
      case 36289:
      case 36303:
      case 36311:
      case 36292:
        return Gg;
    }
  }
  class Wg {
    constructor(t, e, n) {
      this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.setValue = Eg(e.type);
    }
  }
  class Xg {
    constructor(t, e, n) {
      this.id = t, this.addr = n, this.cache = [], this.type = e.type, this.size = e.size, this.setValue = Vg(e.type);
    }
  }
  class Yg {
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
  const Gr = /(\w+)(\])?(\[|\.)?/g;
  function Rl(i, t) {
    i.seq.push(t), i.map[t.id] = t;
  }
  function qg(i, t, e) {
    const n = i.name, s = n.length;
    for (Gr.lastIndex = 0; ; ) {
      const r = Gr.exec(n), a = Gr.lastIndex;
      let o = r[1];
      const l = r[2] === "]", c = r[3];
      if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === s) {
        Rl(e, c === void 0 ? new Wg(o, i, t) : new Xg(o, i, t));
        break;
      } else {
        let d = e.map[o];
        d === void 0 && (d = new Yg(o), Rl(e, d)), e = d;
      }
    }
  }
  class js {
    constructor(t, e) {
      this.seq = [], this.map = {};
      const n = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
      for (let s = 0; s < n; ++s) {
        const r = t.getActiveUniform(e, s), a = t.getUniformLocation(e, r.name);
        qg(r, a, this);
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
  function Pl(i, t, e) {
    const n = i.createShader(t);
    return i.shaderSource(n, e), i.compileShader(n), n;
  }
  const jg = 37297;
  let Kg = 0;
  function Zg(i, t) {
    const e = i.split(`
`), n = [], s = Math.max(t - 6, 0), r = Math.min(t + 6, e.length);
    for (let a = s; a < r; a++) {
      const o = a + 1;
      n.push(`${o === t ? ">" : " "} ${o}: ${e[a]}`);
    }
    return n.join(`
`);
  }
  const Dl = new It();
  function $g(i) {
    Vt._getMatrix(Dl, Vt.workingColorSpace, i);
    const t = `mat3( ${Dl.elements.map((e) => e.toFixed(4))} )`;
    switch (Vt.getTransfer(i)) {
      case lr:
        return [
          t,
          "LinearTransferOETF"
        ];
      case $t:
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
  function Ll(i, t, e) {
    const n = i.getShaderParameter(t, i.COMPILE_STATUS), s = i.getShaderInfoLog(t).trim();
    if (n && s === "") return "";
    const r = /ERROR: 0:(\d+)/.exec(s);
    if (r) {
      const a = parseInt(r[1]);
      return e.toUpperCase() + `

` + s + `

` + Zg(i.getShaderSource(t), a);
    } else return s;
  }
  function Jg(i, t) {
    const e = $g(t);
    return [
      `vec4 ${i}( vec4 value ) {`,
      `	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,
      "}"
    ].join(`
`);
  }
  function Qg(i, t) {
    let e;
    switch (t) {
      case Fc:
        e = "Linear";
        break;
      case Oc:
        e = "Reinhard";
        break;
      case Bc:
        e = "Cineon";
        break;
      case eo:
        e = "ACESFilmic";
        break;
      case kc:
        e = "AgX";
        break;
      case zc:
        e = "Neutral";
        break;
      case od:
        e = "Custom";
        break;
      default:
        console.warn("THREE.WebGLProgram: Unsupported toneMapping:", t), e = "Linear";
    }
    return "vec3 " + i + "( vec3 color ) { return " + e + "ToneMapping( color ); }";
  }
  const Ls = new C();
  function t_() {
    Vt.getLuminanceCoefficients(Ls);
    const i = Ls.x.toFixed(4), t = Ls.y.toFixed(4), e = Ls.z.toFixed(4);
    return [
      "float luminance( const in vec3 rgb ) {",
      `	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,
      "	return dot( weights, rgb );",
      "}"
    ].join(`
`);
  }
  function e_(i) {
    return [
      i.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
      i.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
    ].filter(es).join(`
`);
  }
  function n_(i) {
    const t = [];
    for (const e in i) {
      const n = i[e];
      n !== false && t.push("#define " + e + " " + n);
    }
    return t.join(`
`);
  }
  function i_(i, t) {
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
  function es(i) {
    return i !== "";
  }
  function Il(i, t) {
    const e = t.numSpotLightShadows + t.numSpotLightMaps - t.numSpotLightShadowsWithMaps;
    return i.replace(/NUM_DIR_LIGHTS/g, t.numDirLights).replace(/NUM_SPOT_LIGHTS/g, t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, e).replace(/NUM_RECT_AREA_LIGHTS/g, t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, t.numPointLights).replace(/NUM_HEMI_LIGHTS/g, t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, t.numPointLightShadows);
  }
  function Ul(i, t) {
    return i.replace(/NUM_CLIPPING_PLANES/g, t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, t.numClippingPlanes - t.numClipIntersection);
  }
  const s_ = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function Ha(i) {
    return i.replace(s_, a_);
  }
  const r_ = /* @__PURE__ */ new Map();
  function a_(i, t) {
    let e = Nt[t];
    if (e === void 0) {
      const n = r_.get(t);
      if (n !== void 0) e = Nt[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', t, n);
      else throw new Error("Can not resolve #include <" + t + ">");
    }
    return Ha(e);
  }
  const o_ = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
  function Nl(i) {
    return i.replace(o_, l_);
  }
  function l_(i, t, e, n) {
    let s = "";
    for (let r = parseInt(t); r < parseInt(e); r++) s += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
    return s;
  }
  function Fl(i) {
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
  function c_(i) {
    let t = "SHADOWMAP_TYPE_BASIC";
    return i.shadowMapType === Uc ? t = "SHADOWMAP_TYPE_PCF" : i.shadowMapType === zu ? t = "SHADOWMAP_TYPE_PCF_SOFT" : i.shadowMapType === fn && (t = "SHADOWMAP_TYPE_VSM"), t;
  }
  function h_(i) {
    let t = "ENVMAP_TYPE_CUBE";
    if (i.envMap) switch (i.envMapMode) {
      case Pi:
      case Di:
        t = "ENVMAP_TYPE_CUBE";
        break;
      case or:
        t = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
    return t;
  }
  function u_(i) {
    let t = "ENVMAP_MODE_REFLECTION";
    if (i.envMap) switch (i.envMapMode) {
      case Di:
        t = "ENVMAP_MODE_REFRACTION";
        break;
    }
    return t;
  }
  function d_(i) {
    let t = "ENVMAP_BLENDING_NONE";
    if (i.envMap) switch (i.combine) {
      case Nc:
        t = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case rd:
        t = "ENVMAP_BLENDING_MIX";
        break;
      case ad:
        t = "ENVMAP_BLENDING_ADD";
        break;
    }
    return t;
  }
  function f_(i) {
    const t = i.envMapCubeUVHeight;
    if (t === null) return null;
    const e = Math.log2(t) - 2, n = 1 / t;
    return {
      texelWidth: 1 / (3 * Math.max(Math.pow(2, e), 7 * 16)),
      texelHeight: n,
      maxMip: e
    };
  }
  function p_(i, t, e, n) {
    const s = i.getContext(), r = e.defines;
    let a = e.vertexShader, o = e.fragmentShader;
    const l = c_(e), c = h_(e), h = u_(e), d = d_(e), f = f_(e), p = e_(e), g = n_(r), _ = s.createProgram();
    let m, u, E = e.glslVersion ? "#version " + e.glslVersion + `
` : "";
    e.isRawShaderMaterial ? (m = [
      "#define SHADER_TYPE " + e.shaderType,
      "#define SHADER_NAME " + e.shaderName,
      g
    ].filter(es).join(`
`), m.length > 0 && (m += `
`), u = [
      "#define SHADER_TYPE " + e.shaderType,
      "#define SHADER_NAME " + e.shaderName,
      g
    ].filter(es).join(`
`), u.length > 0 && (u += `
`)) : (m = [
      Fl(e),
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
    ].filter(es).join(`
`), u = [
      Fl(e),
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
      e.toneMapping !== Un ? "#define TONE_MAPPING" : "",
      e.toneMapping !== Un ? Nt.tonemapping_pars_fragment : "",
      e.toneMapping !== Un ? Qg("toneMapping", e.toneMapping) : "",
      e.dithering ? "#define DITHERING" : "",
      e.opaque ? "#define OPAQUE" : "",
      Nt.colorspace_pars_fragment,
      Jg("linearToOutputTexel", e.outputColorSpace),
      t_(),
      e.useDepthPacking ? "#define DEPTH_PACKING " + e.depthPacking : "",
      `
`
    ].filter(es).join(`
`)), a = Ha(a), a = Il(a, e), a = Ul(a, e), o = Ha(o), o = Il(o, e), o = Ul(o, e), a = Nl(a), o = Nl(o), e.isRawShaderMaterial !== true && (E = `#version 300 es
`, m = [
      p,
      "#define attribute in",
      "#define varying out",
      "#define texture2D texture"
    ].join(`
`) + `
` + m, u = [
      "#define varying in",
      e.glslVersion === jo ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
      e.glslVersion === jo ? "" : "#define gl_FragColor pc_fragColor",
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
    const b = E + m + a, S = E + u + o, N = Pl(s, s.VERTEX_SHADER, b), w = Pl(s, s.FRAGMENT_SHADER, S);
    s.attachShader(_, N), s.attachShader(_, w), e.index0AttributeName !== void 0 ? s.bindAttribLocation(_, 0, e.index0AttributeName) : e.morphTargets === true && s.bindAttribLocation(_, 0, "position"), s.linkProgram(_);
    function A(R) {
      if (i.debug.checkShaderErrors) {
        const G = s.getProgramInfoLog(_).trim(), k = s.getShaderInfoLog(N).trim(), X = s.getShaderInfoLog(w).trim();
        let Z = true, V = true;
        if (s.getProgramParameter(_, s.LINK_STATUS) === false) if (Z = false, typeof i.debug.onShaderError == "function") i.debug.onShaderError(s, _, N, w);
        else {
          const Q = Ll(s, N, "vertex"), H = Ll(s, w, "fragment");
          console.error("THREE.WebGLProgram: Shader Error " + s.getError() + " - VALIDATE_STATUS " + s.getProgramParameter(_, s.VALIDATE_STATUS) + `

Material Name: ` + R.name + `
Material Type: ` + R.type + `

Program Info Log: ` + G + `
` + Q + `
` + H);
        }
        else G !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", G) : (k === "" || X === "") && (V = false);
        V && (R.diagnostics = {
          runnable: Z,
          programLog: G,
          vertexShader: {
            log: k,
            prefix: m
          },
          fragmentShader: {
            log: X,
            prefix: u
          }
        });
      }
      s.deleteShader(N), s.deleteShader(w), P = new js(s, _), y = i_(s, _);
    }
    let P;
    this.getUniforms = function() {
      return P === void 0 && A(this), P;
    };
    let y;
    this.getAttributes = function() {
      return y === void 0 && A(this), y;
    };
    let x = e.rendererExtensionParallelShaderCompile === false;
    return this.isReady = function() {
      return x === false && (x = s.getProgramParameter(_, jg)), x;
    }, this.destroy = function() {
      n.releaseStatesOfProgram(this), s.deleteProgram(_), this.program = void 0;
    }, this.type = e.shaderType, this.name = e.shaderName, this.id = Kg++, this.cacheKey = t, this.usedTimes = 1, this.program = _, this.vertexShader = N, this.fragmentShader = w, this;
  }
  let m_ = 0;
  class g_ {
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
      return n === void 0 && (n = new __(t), e.set(t, n)), n;
    }
  }
  class __ {
    constructor(t) {
      this.id = m_++, this.code = t, this.usedTimes = 0;
    }
  }
  function v_(i, t, e, n, s, r, a) {
    const o = new ho(), l = new g_(), c = /* @__PURE__ */ new Set(), h = [], d = s.logarithmicDepthBuffer, f = s.vertexTextures;
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
    function _(y) {
      return c.add(y), y === 0 ? "uv" : `uv${y}`;
    }
    function m(y, x, R, G, k) {
      const X = G.fog, Z = k.geometry, V = y.isMeshStandardMaterial ? G.environment : null, Q = (y.isMeshStandardMaterial ? e : t).get(y.envMap || V), H = Q && Q.mapping === or ? Q.image.height : null, st = g[y.type];
      y.precision !== null && (p = s.getMaxPrecision(y.precision), p !== y.precision && console.warn("THREE.WebGLProgram.getParameters:", y.precision, "not supported, using", p, "instead."));
      const ht = Z.morphAttributes.position || Z.morphAttributes.normal || Z.morphAttributes.color, St = ht !== void 0 ? ht.length : 0;
      let Ft = 0;
      Z.morphAttributes.position !== void 0 && (Ft = 1), Z.morphAttributes.normal !== void 0 && (Ft = 2), Z.morphAttributes.color !== void 0 && (Ft = 3);
      let te, Y, tt, vt;
      if (st) {
        const Zt = tn[st];
        te = Zt.vertexShader, Y = Zt.fragmentShader;
      } else te = y.vertexShader, Y = y.fragmentShader, l.update(y), tt = l.getVertexShaderID(y), vt = l.getFragmentShaderID(y);
      const rt = i.getRenderTarget(), wt = i.state.buffers.depth.getReversed(), Rt = k.isInstancedMesh === true, Ot = k.isBatchedMesh === true, oe = !!y.map, Wt = !!y.matcap, de = !!Q, U = !!y.aoMap, ze = !!y.lightMap, zt = !!y.bumpMap, Ht = !!y.normalMap, bt = !!y.displacementMap, ie = !!y.emissiveMap, yt = !!y.metalnessMap, T = !!y.roughnessMap, v = y.anisotropy > 0, F = y.clearcoat > 0, q = y.dispersion > 0, K = y.iridescence > 0, W = y.sheen > 0, xt = y.transmission > 0, at = v && !!y.anisotropyMap, ut = F && !!y.clearcoatMap, Xt = F && !!y.clearcoatNormalMap, $ = F && !!y.clearcoatRoughnessMap, dt = K && !!y.iridescenceMap, Tt = K && !!y.iridescenceThicknessMap, At = W && !!y.sheenColorMap, ft = W && !!y.sheenRoughnessMap, Gt = !!y.specularMap, Ut = !!y.specularColorMap, ee = !!y.specularIntensityMap, D = xt && !!y.transmissionMap, it = xt && !!y.thicknessMap, z = !!y.gradientMap, j = !!y.alphaMap, ct = y.alphaTest > 0, ot = !!y.alphaHash, Dt = !!y.extensions;
      let ce = Un;
      y.toneMapped && (rt === null || rt.isXRRenderTarget === true) && (ce = i.toneMapping);
      const ye = {
        shaderID: st,
        shaderType: y.type,
        shaderName: y.name,
        vertexShader: te,
        fragmentShader: Y,
        defines: y.defines,
        customVertexShaderID: tt,
        customFragmentShaderID: vt,
        isRawShaderMaterial: y.isRawShaderMaterial === true,
        glslVersion: y.glslVersion,
        precision: p,
        batching: Ot,
        batchingColor: Ot && k._colorsTexture !== null,
        instancing: Rt,
        instancingColor: Rt && k.instanceColor !== null,
        instancingMorph: Rt && k.morphTexture !== null,
        supportsVertexTextures: f,
        outputColorSpace: rt === null ? i.outputColorSpace : rt.isXRRenderTarget === true ? rt.texture.colorSpace : Bi,
        alphaToCoverage: !!y.alphaToCoverage,
        map: oe,
        matcap: Wt,
        envMap: de,
        envMapMode: de && Q.mapping,
        envMapCubeUVHeight: H,
        aoMap: U,
        lightMap: ze,
        bumpMap: zt,
        normalMap: Ht,
        displacementMap: f && bt,
        emissiveMap: ie,
        normalMapObjectSpace: Ht && y.normalMapType === ud,
        normalMapTangentSpace: Ht && y.normalMapType === $c,
        metalnessMap: yt,
        roughnessMap: T,
        anisotropy: v,
        anisotropyMap: at,
        clearcoat: F,
        clearcoatMap: ut,
        clearcoatNormalMap: Xt,
        clearcoatRoughnessMap: $,
        dispersion: q,
        iridescence: K,
        iridescenceMap: dt,
        iridescenceThicknessMap: Tt,
        sheen: W,
        sheenColorMap: At,
        sheenRoughnessMap: ft,
        specularMap: Gt,
        specularColorMap: Ut,
        specularIntensityMap: ee,
        transmission: xt,
        transmissionMap: D,
        thicknessMap: it,
        gradientMap: z,
        opaque: y.transparent === false && y.blending === wi && y.alphaToCoverage === false,
        alphaMap: j,
        alphaTest: ct,
        alphaHash: ot,
        combine: y.combine,
        mapUv: oe && _(y.map.channel),
        aoMapUv: U && _(y.aoMap.channel),
        lightMapUv: ze && _(y.lightMap.channel),
        bumpMapUv: zt && _(y.bumpMap.channel),
        normalMapUv: Ht && _(y.normalMap.channel),
        displacementMapUv: bt && _(y.displacementMap.channel),
        emissiveMapUv: ie && _(y.emissiveMap.channel),
        metalnessMapUv: yt && _(y.metalnessMap.channel),
        roughnessMapUv: T && _(y.roughnessMap.channel),
        anisotropyMapUv: at && _(y.anisotropyMap.channel),
        clearcoatMapUv: ut && _(y.clearcoatMap.channel),
        clearcoatNormalMapUv: Xt && _(y.clearcoatNormalMap.channel),
        clearcoatRoughnessMapUv: $ && _(y.clearcoatRoughnessMap.channel),
        iridescenceMapUv: dt && _(y.iridescenceMap.channel),
        iridescenceThicknessMapUv: Tt && _(y.iridescenceThicknessMap.channel),
        sheenColorMapUv: At && _(y.sheenColorMap.channel),
        sheenRoughnessMapUv: ft && _(y.sheenRoughnessMap.channel),
        specularMapUv: Gt && _(y.specularMap.channel),
        specularColorMapUv: Ut && _(y.specularColorMap.channel),
        specularIntensityMapUv: ee && _(y.specularIntensityMap.channel),
        transmissionMapUv: D && _(y.transmissionMap.channel),
        thicknessMapUv: it && _(y.thicknessMap.channel),
        alphaMapUv: j && _(y.alphaMap.channel),
        vertexTangents: !!Z.attributes.tangent && (Ht || v),
        vertexColors: y.vertexColors,
        vertexAlphas: y.vertexColors === true && !!Z.attributes.color && Z.attributes.color.itemSize === 4,
        pointsUvs: k.isPoints === true && !!Z.attributes.uv && (oe || j),
        fog: !!X,
        useFog: y.fog === true,
        fogExp2: !!X && X.isFogExp2,
        flatShading: y.flatShading === true,
        sizeAttenuation: y.sizeAttenuation === true,
        logarithmicDepthBuffer: d,
        reverseDepthBuffer: wt,
        skinning: k.isSkinnedMesh === true,
        morphTargets: Z.morphAttributes.position !== void 0,
        morphNormals: Z.morphAttributes.normal !== void 0,
        morphColors: Z.morphAttributes.color !== void 0,
        morphTargetsCount: St,
        morphTextureStride: Ft,
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
        shadowMapEnabled: i.shadowMap.enabled && R.length > 0,
        shadowMapType: i.shadowMap.type,
        toneMapping: ce,
        decodeVideoTexture: oe && y.map.isVideoTexture === true && Vt.getTransfer(y.map.colorSpace) === $t,
        decodeVideoTextureEmissive: ie && y.emissiveMap.isVideoTexture === true && Vt.getTransfer(y.emissiveMap.colorSpace) === $t,
        premultipliedAlpha: y.premultipliedAlpha,
        doubleSided: y.side === Ce,
        flipSided: y.side === Ue,
        useDepthPacking: y.depthPacking >= 0,
        depthPacking: y.depthPacking || 0,
        index0AttributeName: y.index0AttributeName,
        extensionClipCullDistance: Dt && y.extensions.clipCullDistance === true && n.has("WEBGL_clip_cull_distance"),
        extensionMultiDraw: (Dt && y.extensions.multiDraw === true || Ot) && n.has("WEBGL_multi_draw"),
        rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
        customProgramCacheKey: y.customProgramCacheKey()
      };
      return ye.vertexUv1s = c.has(1), ye.vertexUv2s = c.has(2), ye.vertexUv3s = c.has(3), c.clear(), ye;
    }
    function u(y) {
      const x = [];
      if (y.shaderID ? x.push(y.shaderID) : (x.push(y.customVertexShaderID), x.push(y.customFragmentShaderID)), y.defines !== void 0) for (const R in y.defines) x.push(R), x.push(y.defines[R]);
      return y.isRawShaderMaterial === false && (E(x, y), b(x, y), x.push(i.outputColorSpace)), x.push(y.customProgramCacheKey), x.join();
    }
    function E(y, x) {
      y.push(x.precision), y.push(x.outputColorSpace), y.push(x.envMapMode), y.push(x.envMapCubeUVHeight), y.push(x.mapUv), y.push(x.alphaMapUv), y.push(x.lightMapUv), y.push(x.aoMapUv), y.push(x.bumpMapUv), y.push(x.normalMapUv), y.push(x.displacementMapUv), y.push(x.emissiveMapUv), y.push(x.metalnessMapUv), y.push(x.roughnessMapUv), y.push(x.anisotropyMapUv), y.push(x.clearcoatMapUv), y.push(x.clearcoatNormalMapUv), y.push(x.clearcoatRoughnessMapUv), y.push(x.iridescenceMapUv), y.push(x.iridescenceThicknessMapUv), y.push(x.sheenColorMapUv), y.push(x.sheenRoughnessMapUv), y.push(x.specularMapUv), y.push(x.specularColorMapUv), y.push(x.specularIntensityMapUv), y.push(x.transmissionMapUv), y.push(x.thicknessMapUv), y.push(x.combine), y.push(x.fogExp2), y.push(x.sizeAttenuation), y.push(x.morphTargetsCount), y.push(x.morphAttributeCount), y.push(x.numDirLights), y.push(x.numPointLights), y.push(x.numSpotLights), y.push(x.numSpotLightMaps), y.push(x.numHemiLights), y.push(x.numRectAreaLights), y.push(x.numDirLightShadows), y.push(x.numPointLightShadows), y.push(x.numSpotLightShadows), y.push(x.numSpotLightShadowsWithMaps), y.push(x.numLightProbes), y.push(x.shadowMapType), y.push(x.toneMapping), y.push(x.numClippingPlanes), y.push(x.numClipIntersection), y.push(x.depthPacking);
    }
    function b(y, x) {
      o.disableAll(), x.supportsVertexTextures && o.enable(0), x.instancing && o.enable(1), x.instancingColor && o.enable(2), x.instancingMorph && o.enable(3), x.matcap && o.enable(4), x.envMap && o.enable(5), x.normalMapObjectSpace && o.enable(6), x.normalMapTangentSpace && o.enable(7), x.clearcoat && o.enable(8), x.iridescence && o.enable(9), x.alphaTest && o.enable(10), x.vertexColors && o.enable(11), x.vertexAlphas && o.enable(12), x.vertexUv1s && o.enable(13), x.vertexUv2s && o.enable(14), x.vertexUv3s && o.enable(15), x.vertexTangents && o.enable(16), x.anisotropy && o.enable(17), x.alphaHash && o.enable(18), x.batching && o.enable(19), x.dispersion && o.enable(20), x.batchingColor && o.enable(21), y.push(o.mask), o.disableAll(), x.fog && o.enable(0), x.useFog && o.enable(1), x.flatShading && o.enable(2), x.logarithmicDepthBuffer && o.enable(3), x.reverseDepthBuffer && o.enable(4), x.skinning && o.enable(5), x.morphTargets && o.enable(6), x.morphNormals && o.enable(7), x.morphColors && o.enable(8), x.premultipliedAlpha && o.enable(9), x.shadowMapEnabled && o.enable(10), x.doubleSided && o.enable(11), x.flipSided && o.enable(12), x.useDepthPacking && o.enable(13), x.dithering && o.enable(14), x.transmission && o.enable(15), x.sheen && o.enable(16), x.opaque && o.enable(17), x.pointsUvs && o.enable(18), x.decodeVideoTexture && o.enable(19), x.decodeVideoTextureEmissive && o.enable(20), x.alphaToCoverage && o.enable(21), y.push(o.mask);
    }
    function S(y) {
      const x = g[y.type];
      let R;
      if (x) {
        const G = tn[x];
        R = as.clone(G.uniforms);
      } else R = y.uniforms;
      return R;
    }
    function N(y, x) {
      let R;
      for (let G = 0, k = h.length; G < k; G++) {
        const X = h[G];
        if (X.cacheKey === x) {
          R = X, ++R.usedTimes;
          break;
        }
      }
      return R === void 0 && (R = new p_(i, x, y, r), h.push(R)), R;
    }
    function w(y) {
      if (--y.usedTimes === 0) {
        const x = h.indexOf(y);
        h[x] = h[h.length - 1], h.pop(), y.destroy();
      }
    }
    function A(y) {
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
      releaseProgram: w,
      releaseShaderCache: A,
      programs: h,
      dispose: P
    };
  }
  function x_() {
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
  function M_(i, t) {
    return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.material.id !== t.material.id ? i.material.id - t.material.id : i.z !== t.z ? i.z - t.z : i.id - t.id;
  }
  function Ol(i, t) {
    return i.groupOrder !== t.groupOrder ? i.groupOrder - t.groupOrder : i.renderOrder !== t.renderOrder ? i.renderOrder - t.renderOrder : i.z !== t.z ? t.z - i.z : i.id - t.id;
  }
  function Bl() {
    const i = [];
    let t = 0;
    const e = [], n = [], s = [];
    function r() {
      t = 0, e.length = 0, n.length = 0, s.length = 0;
    }
    function a(d, f, p, g, _, m) {
      let u = i[t];
      return u === void 0 ? (u = {
        id: d.id,
        object: d,
        geometry: f,
        material: p,
        groupOrder: g,
        renderOrder: d.renderOrder,
        z: _,
        group: m
      }, i[t] = u) : (u.id = d.id, u.object = d, u.geometry = f, u.material = p, u.groupOrder = g, u.renderOrder = d.renderOrder, u.z = _, u.group = m), t++, u;
    }
    function o(d, f, p, g, _, m) {
      const u = a(d, f, p, g, _, m);
      p.transmission > 0 ? n.push(u) : p.transparent === true ? s.push(u) : e.push(u);
    }
    function l(d, f, p, g, _, m) {
      const u = a(d, f, p, g, _, m);
      p.transmission > 0 ? n.unshift(u) : p.transparent === true ? s.unshift(u) : e.unshift(u);
    }
    function c(d, f) {
      e.length > 1 && e.sort(d || M_), n.length > 1 && n.sort(f || Ol), s.length > 1 && s.sort(f || Ol);
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
  function S_() {
    let i = /* @__PURE__ */ new WeakMap();
    function t(n, s) {
      const r = i.get(n);
      let a;
      return r === void 0 ? (a = new Bl(), i.set(n, [
        a
      ])) : s >= r.length ? (a = new Bl(), r.push(a)) : a = r[s], a;
    }
    function e() {
      i = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: t,
      dispose: e
    };
  }
  function y_() {
    const i = {};
    return {
      get: function(t) {
        if (i[t.id] !== void 0) return i[t.id];
        let e;
        switch (t.type) {
          case "DirectionalLight":
            e = {
              direction: new C(),
              color: new Et()
            };
            break;
          case "SpotLight":
            e = {
              position: new C(),
              direction: new C(),
              color: new Et(),
              distance: 0,
              coneCos: 0,
              penumbraCos: 0,
              decay: 0
            };
            break;
          case "PointLight":
            e = {
              position: new C(),
              color: new Et(),
              distance: 0,
              decay: 0
            };
            break;
          case "HemisphereLight":
            e = {
              direction: new C(),
              skyColor: new Et(),
              groundColor: new Et()
            };
            break;
          case "RectAreaLight":
            e = {
              color: new Et(),
              position: new C(),
              halfWidth: new C(),
              halfHeight: new C()
            };
            break;
        }
        return i[t.id] = e, e;
      }
    };
  }
  function E_() {
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
  let b_ = 0;
  function T_(i, t) {
    return (t.castShadow ? 2 : 0) - (i.castShadow ? 2 : 0) + (t.map ? 1 : 0) - (i.map ? 1 : 0);
  }
  function w_(i) {
    const t = new y_(), e = E_(), n = {
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
    for (let c = 0; c < 9; c++) n.probe.push(new C());
    const s = new C(), r = new qt(), a = new qt();
    function o(c) {
      let h = 0, d = 0, f = 0;
      for (let y = 0; y < 9; y++) n.probe[y].set(0, 0, 0);
      let p = 0, g = 0, _ = 0, m = 0, u = 0, E = 0, b = 0, S = 0, N = 0, w = 0, A = 0;
      c.sort(T_);
      for (let y = 0, x = c.length; y < x; y++) {
        const R = c[y], G = R.color, k = R.intensity, X = R.distance, Z = R.shadow && R.shadow.map ? R.shadow.map.texture : null;
        if (R.isAmbientLight) h += G.r * k, d += G.g * k, f += G.b * k;
        else if (R.isLightProbe) {
          for (let V = 0; V < 9; V++) n.probe[V].addScaledVector(R.sh.coefficients[V], k);
          A++;
        } else if (R.isDirectionalLight) {
          const V = t.get(R);
          if (V.color.copy(R.color).multiplyScalar(R.intensity), R.castShadow) {
            const Q = R.shadow, H = e.get(R);
            H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, n.directionalShadow[p] = H, n.directionalShadowMap[p] = Z, n.directionalShadowMatrix[p] = R.shadow.matrix, E++;
          }
          n.directional[p] = V, p++;
        } else if (R.isSpotLight) {
          const V = t.get(R);
          V.position.setFromMatrixPosition(R.matrixWorld), V.color.copy(G).multiplyScalar(k), V.distance = X, V.coneCos = Math.cos(R.angle), V.penumbraCos = Math.cos(R.angle * (1 - R.penumbra)), V.decay = R.decay, n.spot[_] = V;
          const Q = R.shadow;
          if (R.map && (n.spotLightMap[N] = R.map, N++, Q.updateMatrices(R), R.castShadow && w++), n.spotLightMatrix[_] = Q.matrix, R.castShadow) {
            const H = e.get(R);
            H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, n.spotShadow[_] = H, n.spotShadowMap[_] = Z, S++;
          }
          _++;
        } else if (R.isRectAreaLight) {
          const V = t.get(R);
          V.color.copy(G).multiplyScalar(k), V.halfWidth.set(R.width * 0.5, 0, 0), V.halfHeight.set(0, R.height * 0.5, 0), n.rectArea[m] = V, m++;
        } else if (R.isPointLight) {
          const V = t.get(R);
          if (V.color.copy(R.color).multiplyScalar(R.intensity), V.distance = R.distance, V.decay = R.decay, R.castShadow) {
            const Q = R.shadow, H = e.get(R);
            H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, H.shadowCameraNear = Q.camera.near, H.shadowCameraFar = Q.camera.far, n.pointShadow[g] = H, n.pointShadowMap[g] = Z, n.pointShadowMatrix[g] = R.shadow.matrix, b++;
          }
          n.point[g] = V, g++;
        } else if (R.isHemisphereLight) {
          const V = t.get(R);
          V.skyColor.copy(R.color).multiplyScalar(k), V.groundColor.copy(R.groundColor).multiplyScalar(k), n.hemi[u] = V, u++;
        }
      }
      m > 0 && (i.has("OES_texture_float_linear") === true ? (n.rectAreaLTC1 = et.LTC_FLOAT_1, n.rectAreaLTC2 = et.LTC_FLOAT_2) : (n.rectAreaLTC1 = et.LTC_HALF_1, n.rectAreaLTC2 = et.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = d, n.ambient[2] = f;
      const P = n.hash;
      (P.directionalLength !== p || P.pointLength !== g || P.spotLength !== _ || P.rectAreaLength !== m || P.hemiLength !== u || P.numDirectionalShadows !== E || P.numPointShadows !== b || P.numSpotShadows !== S || P.numSpotMaps !== N || P.numLightProbes !== A) && (n.directional.length = p, n.spot.length = _, n.rectArea.length = m, n.point.length = g, n.hemi.length = u, n.directionalShadow.length = E, n.directionalShadowMap.length = E, n.pointShadow.length = b, n.pointShadowMap.length = b, n.spotShadow.length = S, n.spotShadowMap.length = S, n.directionalShadowMatrix.length = E, n.pointShadowMatrix.length = b, n.spotLightMatrix.length = S + N - w, n.spotLightMap.length = N, n.numSpotLightShadowsWithMaps = w, n.numLightProbes = A, P.directionalLength = p, P.pointLength = g, P.spotLength = _, P.rectAreaLength = m, P.hemiLength = u, P.numDirectionalShadows = E, P.numPointShadows = b, P.numSpotShadows = S, P.numSpotMaps = N, P.numLightProbes = A, n.version = b_++);
    }
    function l(c, h) {
      let d = 0, f = 0, p = 0, g = 0, _ = 0;
      const m = h.matrixWorldInverse;
      for (let u = 0, E = c.length; u < E; u++) {
        const b = c[u];
        if (b.isDirectionalLight) {
          const S = n.directional[d];
          S.direction.setFromMatrixPosition(b.matrixWorld), s.setFromMatrixPosition(b.target.matrixWorld), S.direction.sub(s), S.direction.transformDirection(m), d++;
        } else if (b.isSpotLight) {
          const S = n.spot[p];
          S.position.setFromMatrixPosition(b.matrixWorld), S.position.applyMatrix4(m), S.direction.setFromMatrixPosition(b.matrixWorld), s.setFromMatrixPosition(b.target.matrixWorld), S.direction.sub(s), S.direction.transformDirection(m), p++;
        } else if (b.isRectAreaLight) {
          const S = n.rectArea[g];
          S.position.setFromMatrixPosition(b.matrixWorld), S.position.applyMatrix4(m), a.identity(), r.copy(b.matrixWorld), r.premultiply(m), a.extractRotation(r), S.halfWidth.set(b.width * 0.5, 0, 0), S.halfHeight.set(0, b.height * 0.5, 0), S.halfWidth.applyMatrix4(a), S.halfHeight.applyMatrix4(a), g++;
        } else if (b.isPointLight) {
          const S = n.point[f];
          S.position.setFromMatrixPosition(b.matrixWorld), S.position.applyMatrix4(m), f++;
        } else if (b.isHemisphereLight) {
          const S = n.hemi[_];
          S.direction.setFromMatrixPosition(b.matrixWorld), S.direction.transformDirection(m), _++;
        }
      }
    }
    return {
      setup: o,
      setupView: l,
      state: n
    };
  }
  function kl(i) {
    const t = new w_(i), e = [], n = [];
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
  function A_(i) {
    let t = /* @__PURE__ */ new WeakMap();
    function e(s, r = 0) {
      const a = t.get(s);
      let o;
      return a === void 0 ? (o = new kl(i), t.set(s, [
        o
      ])) : r >= a.length ? (o = new kl(i), a.push(o)) : o = a[r], o;
    }
    function n() {
      t = /* @__PURE__ */ new WeakMap();
    }
    return {
      get: e,
      dispose: n
    };
  }
  class C_ extends si {
    static get type() {
      return "MeshDepthMaterial";
    }
    constructor(t) {
      super(), this.isMeshDepthMaterial = true, this.depthPacking = cd, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = false, this.wireframeLinewidth = 1, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this;
    }
  }
  class R_ extends si {
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
  const P_ = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, D_ = `uniform sampler2D shadow_pass;
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
  function L_(i, t, e) {
    let n = new uo();
    const s = new _t(), r = new _t(), a = new Qt(), o = new C_({
      depthPacking: hd
    }), l = new R_(), c = {}, h = e.maxTextureSize, d = {
      [Fn]: Ue,
      [Ue]: Fn,
      [Ce]: Ce
    }, f = new ae({
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
      vertexShader: P_,
      fragmentShader: D_
    }), p = f.clone();
    p.defines.HORIZONTAL_PASS = 1;
    const g = new Me();
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
    const _ = new he(g, f), m = this;
    this.enabled = false, this.autoUpdate = true, this.needsUpdate = false, this.type = Uc;
    let u = this.type;
    this.render = function(w, A, P) {
      if (m.enabled === false || m.autoUpdate === false && m.needsUpdate === false || w.length === 0) return;
      const y = i.getRenderTarget(), x = i.getActiveCubeFace(), R = i.getActiveMipmapLevel(), G = i.state;
      G.setBlending(_n), G.buffers.color.setClear(1, 1, 1, 1), G.buffers.depth.setTest(true), G.setScissorTest(false);
      const k = u !== fn && this.type === fn, X = u === fn && this.type !== fn;
      for (let Z = 0, V = w.length; Z < V; Z++) {
        const Q = w[Z], H = Q.shadow;
        if (H === void 0) {
          console.warn("THREE.WebGLShadowMap:", Q, "has no shadow.");
          continue;
        }
        if (H.autoUpdate === false && H.needsUpdate === false) continue;
        s.copy(H.mapSize);
        const st = H.getFrameExtents();
        if (s.multiply(st), r.copy(H.mapSize), (s.x > h || s.y > h) && (s.x > h && (r.x = Math.floor(h / st.x), s.x = r.x * st.x, H.mapSize.x = r.x), s.y > h && (r.y = Math.floor(h / st.y), s.y = r.y * st.y, H.mapSize.y = r.y)), H.map === null || k === true || X === true) {
          const St = this.type !== fn ? {
            minFilter: ke,
            magFilter: ke
          } : {};
          H.map !== null && H.map.dispose(), H.map = new Je(s.x, s.y, St), H.map.texture.name = Q.name + ".shadowMap", H.camera.updateProjectionMatrix();
        }
        i.setRenderTarget(H.map), i.clear();
        const ht = H.getViewportCount();
        for (let St = 0; St < ht; St++) {
          const Ft = H.getViewport(St);
          a.set(r.x * Ft.x, r.y * Ft.y, r.x * Ft.z, r.y * Ft.w), G.viewport(a), H.updateMatrices(Q, St), n = H.getFrustum(), S(A, P, H.camera, Q, this.type);
        }
        H.isPointLightShadow !== true && this.type === fn && E(H, P), H.needsUpdate = false;
      }
      u = this.type, m.needsUpdate = false, i.setRenderTarget(y, x, R);
    };
    function E(w, A) {
      const P = t.update(_);
      f.defines.VSM_SAMPLES !== w.blurSamples && (f.defines.VSM_SAMPLES = w.blurSamples, p.defines.VSM_SAMPLES = w.blurSamples, f.needsUpdate = true, p.needsUpdate = true), w.mapPass === null && (w.mapPass = new Je(s.x, s.y)), f.uniforms.shadow_pass.value = w.map.texture, f.uniforms.resolution.value = w.mapSize, f.uniforms.radius.value = w.radius, i.setRenderTarget(w.mapPass), i.clear(), i.renderBufferDirect(A, null, P, f, _, null), p.uniforms.shadow_pass.value = w.mapPass.texture, p.uniforms.resolution.value = w.mapSize, p.uniforms.radius.value = w.radius, i.setRenderTarget(w.map), i.clear(), i.renderBufferDirect(A, null, P, p, _, null);
    }
    function b(w, A, P, y) {
      let x = null;
      const R = P.isPointLight === true ? w.customDistanceMaterial : w.customDepthMaterial;
      if (R !== void 0) x = R;
      else if (x = P.isPointLight === true ? l : o, i.localClippingEnabled && A.clipShadows === true && Array.isArray(A.clippingPlanes) && A.clippingPlanes.length !== 0 || A.displacementMap && A.displacementScale !== 0 || A.alphaMap && A.alphaTest > 0 || A.map && A.alphaTest > 0) {
        const G = x.uuid, k = A.uuid;
        let X = c[G];
        X === void 0 && (X = {}, c[G] = X);
        let Z = X[k];
        Z === void 0 && (Z = x.clone(), X[k] = Z, A.addEventListener("dispose", N)), x = Z;
      }
      if (x.visible = A.visible, x.wireframe = A.wireframe, y === fn ? x.side = A.shadowSide !== null ? A.shadowSide : A.side : x.side = A.shadowSide !== null ? A.shadowSide : d[A.side], x.alphaMap = A.alphaMap, x.alphaTest = A.alphaTest, x.map = A.map, x.clipShadows = A.clipShadows, x.clippingPlanes = A.clippingPlanes, x.clipIntersection = A.clipIntersection, x.displacementMap = A.displacementMap, x.displacementScale = A.displacementScale, x.displacementBias = A.displacementBias, x.wireframeLinewidth = A.wireframeLinewidth, x.linewidth = A.linewidth, P.isPointLight === true && x.isMeshDistanceMaterial === true) {
        const G = i.properties.get(x);
        G.light = P;
      }
      return x;
    }
    function S(w, A, P, y, x) {
      if (w.visible === false) return;
      if (w.layers.test(A.layers) && (w.isMesh || w.isLine || w.isPoints) && (w.castShadow || w.receiveShadow && x === fn) && (!w.frustumCulled || n.intersectsObject(w))) {
        w.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse, w.matrixWorld);
        const k = t.update(w), X = w.material;
        if (Array.isArray(X)) {
          const Z = k.groups;
          for (let V = 0, Q = Z.length; V < Q; V++) {
            const H = Z[V], st = X[H.materialIndex];
            if (st && st.visible) {
              const ht = b(w, st, y, x);
              w.onBeforeShadow(i, w, A, P, k, ht, H), i.renderBufferDirect(P, null, k, ht, w, H), w.onAfterShadow(i, w, A, P, k, ht, H);
            }
          }
        } else if (X.visible) {
          const Z = b(w, X, y, x);
          w.onBeforeShadow(i, w, A, P, k, Z, null), i.renderBufferDirect(P, null, k, Z, w, null), w.onAfterShadow(i, w, A, P, k, Z, null);
        }
      }
      const G = w.children;
      for (let k = 0, X = G.length; k < X; k++) S(G[k], A, P, y, x);
    }
    function N(w) {
      w.target.removeEventListener("dispose", N);
      for (const P in c) {
        const y = c[P], x = w.target.uuid;
        x in y && (y[x].dispose(), delete y[x]);
      }
    }
  }
  const I_ = {
    [sa]: ra,
    [aa]: ca,
    [oa]: ha,
    [Ri]: la,
    [ra]: sa,
    [ca]: aa,
    [ha]: oa,
    [la]: Ri
  };
  function U_(i, t) {
    function e() {
      let D = false;
      const it = new Qt();
      let z = null;
      const j = new Qt(0, 0, 0, 0);
      return {
        setMask: function(ct) {
          z !== ct && !D && (i.colorMask(ct, ct, ct, ct), z = ct);
        },
        setLocked: function(ct) {
          D = ct;
        },
        setClear: function(ct, ot, Dt, ce, ye) {
          ye === true && (ct *= ce, ot *= ce, Dt *= ce), it.set(ct, ot, Dt, ce), j.equals(it) === false && (i.clearColor(ct, ot, Dt, ce), j.copy(it));
        },
        reset: function() {
          D = false, z = null, j.set(-1, 0, 0, 0);
        }
      };
    }
    function n() {
      let D = false, it = false, z = null, j = null, ct = null;
      return {
        setReversed: function(ot) {
          if (it !== ot) {
            const Dt = t.get("EXT_clip_control");
            it ? Dt.clipControlEXT(Dt.LOWER_LEFT_EXT, Dt.ZERO_TO_ONE_EXT) : Dt.clipControlEXT(Dt.LOWER_LEFT_EXT, Dt.NEGATIVE_ONE_TO_ONE_EXT);
            const ce = ct;
            ct = null, this.setClear(ce);
          }
          it = ot;
        },
        getReversed: function() {
          return it;
        },
        setTest: function(ot) {
          ot ? rt(i.DEPTH_TEST) : wt(i.DEPTH_TEST);
        },
        setMask: function(ot) {
          z !== ot && !D && (i.depthMask(ot), z = ot);
        },
        setFunc: function(ot) {
          if (it && (ot = I_[ot]), j !== ot) {
            switch (ot) {
              case sa:
                i.depthFunc(i.NEVER);
                break;
              case ra:
                i.depthFunc(i.ALWAYS);
                break;
              case aa:
                i.depthFunc(i.LESS);
                break;
              case Ri:
                i.depthFunc(i.LEQUAL);
                break;
              case oa:
                i.depthFunc(i.EQUAL);
                break;
              case la:
                i.depthFunc(i.GEQUAL);
                break;
              case ca:
                i.depthFunc(i.GREATER);
                break;
              case ha:
                i.depthFunc(i.NOTEQUAL);
                break;
              default:
                i.depthFunc(i.LEQUAL);
            }
            j = ot;
          }
        },
        setLocked: function(ot) {
          D = ot;
        },
        setClear: function(ot) {
          ct !== ot && (it && (ot = 1 - ot), i.clearDepth(ot), ct = ot);
        },
        reset: function() {
          D = false, z = null, j = null, ct = null, it = false;
        }
      };
    }
    function s() {
      let D = false, it = null, z = null, j = null, ct = null, ot = null, Dt = null, ce = null, ye = null;
      return {
        setTest: function(Zt) {
          D || (Zt ? rt(i.STENCIL_TEST) : wt(i.STENCIL_TEST));
        },
        setMask: function(Zt) {
          it !== Zt && !D && (i.stencilMask(Zt), it = Zt);
        },
        setFunc: function(Zt, We, an) {
          (z !== Zt || j !== We || ct !== an) && (i.stencilFunc(Zt, We, an), z = Zt, j = We, ct = an);
        },
        setOp: function(Zt, We, an) {
          (ot !== Zt || Dt !== We || ce !== an) && (i.stencilOp(Zt, We, an), ot = Zt, Dt = We, ce = an);
        },
        setLocked: function(Zt) {
          D = Zt;
        },
        setClear: function(Zt) {
          ye !== Zt && (i.clearStencil(Zt), ye = Zt);
        },
        reset: function() {
          D = false, it = null, z = null, j = null, ct = null, ot = null, Dt = null, ce = null, ye = null;
        }
      };
    }
    const r = new e(), a = new n(), o = new s(), l = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
    let h = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = false, m = null, u = null, E = null, b = null, S = null, N = null, w = null, A = new Et(0, 0, 0), P = 0, y = false, x = null, R = null, G = null, k = null, X = null;
    const Z = i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    let V = false, Q = 0;
    const H = i.getParameter(i.VERSION);
    H.indexOf("WebGL") !== -1 ? (Q = parseFloat(/^WebGL (\d)/.exec(H)[1]), V = Q >= 1) : H.indexOf("OpenGL ES") !== -1 && (Q = parseFloat(/^OpenGL ES (\d)/.exec(H)[1]), V = Q >= 2);
    let st = null, ht = {};
    const St = i.getParameter(i.SCISSOR_BOX), Ft = i.getParameter(i.VIEWPORT), te = new Qt().fromArray(St), Y = new Qt().fromArray(Ft);
    function tt(D, it, z, j) {
      const ct = new Uint8Array(4), ot = i.createTexture();
      i.bindTexture(D, ot), i.texParameteri(D, i.TEXTURE_MIN_FILTER, i.NEAREST), i.texParameteri(D, i.TEXTURE_MAG_FILTER, i.NEAREST);
      for (let Dt = 0; Dt < z; Dt++) D === i.TEXTURE_3D || D === i.TEXTURE_2D_ARRAY ? i.texImage3D(it, 0, i.RGBA, 1, 1, j, 0, i.RGBA, i.UNSIGNED_BYTE, ct) : i.texImage2D(it + Dt, 0, i.RGBA, 1, 1, 0, i.RGBA, i.UNSIGNED_BYTE, ct);
      return ot;
    }
    const vt = {};
    vt[i.TEXTURE_2D] = tt(i.TEXTURE_2D, i.TEXTURE_2D, 1), vt[i.TEXTURE_CUBE_MAP] = tt(i.TEXTURE_CUBE_MAP, i.TEXTURE_CUBE_MAP_POSITIVE_X, 6), vt[i.TEXTURE_2D_ARRAY] = tt(i.TEXTURE_2D_ARRAY, i.TEXTURE_2D_ARRAY, 1, 1), vt[i.TEXTURE_3D] = tt(i.TEXTURE_3D, i.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), a.setClear(1), o.setClear(0), rt(i.DEPTH_TEST), a.setFunc(Ri), zt(false), Ht(Vo), rt(i.CULL_FACE), U(_n);
    function rt(D) {
      h[D] !== true && (i.enable(D), h[D] = true);
    }
    function wt(D) {
      h[D] !== false && (i.disable(D), h[D] = false);
    }
    function Rt(D, it) {
      return d[D] !== it ? (i.bindFramebuffer(D, it), d[D] = it, D === i.DRAW_FRAMEBUFFER && (d[i.FRAMEBUFFER] = it), D === i.FRAMEBUFFER && (d[i.DRAW_FRAMEBUFFER] = it), true) : false;
    }
    function Ot(D, it) {
      let z = p, j = false;
      if (D) {
        z = f.get(it), z === void 0 && (z = [], f.set(it, z));
        const ct = D.textures;
        if (z.length !== ct.length || z[0] !== i.COLOR_ATTACHMENT0) {
          for (let ot = 0, Dt = ct.length; ot < Dt; ot++) z[ot] = i.COLOR_ATTACHMENT0 + ot;
          z.length = ct.length, j = true;
        }
      } else z[0] !== i.BACK && (z[0] = i.BACK, j = true);
      j && i.drawBuffers(z);
    }
    function oe(D) {
      return g !== D ? (i.useProgram(D), g = D, true) : false;
    }
    const Wt = {
      [qn]: i.FUNC_ADD,
      [Gu]: i.FUNC_SUBTRACT,
      [Vu]: i.FUNC_REVERSE_SUBTRACT
    };
    Wt[Wu] = i.MIN, Wt[Xu] = i.MAX;
    const de = {
      [Yu]: i.ZERO,
      [qu]: i.ONE,
      [ju]: i.SRC_COLOR,
      [na]: i.SRC_ALPHA,
      [td]: i.SRC_ALPHA_SATURATE,
      [Ju]: i.DST_COLOR,
      [Zu]: i.DST_ALPHA,
      [Ku]: i.ONE_MINUS_SRC_COLOR,
      [ia]: i.ONE_MINUS_SRC_ALPHA,
      [Qu]: i.ONE_MINUS_DST_COLOR,
      [$u]: i.ONE_MINUS_DST_ALPHA,
      [ed]: i.CONSTANT_COLOR,
      [nd]: i.ONE_MINUS_CONSTANT_COLOR,
      [id]: i.CONSTANT_ALPHA,
      [sd]: i.ONE_MINUS_CONSTANT_ALPHA
    };
    function U(D, it, z, j, ct, ot, Dt, ce, ye, Zt) {
      if (D === _n) {
        _ === true && (wt(i.BLEND), _ = false);
        return;
      }
      if (_ === false && (rt(i.BLEND), _ = true), D !== Hu) {
        if (D !== m || Zt !== y) {
          if ((u !== qn || S !== qn) && (i.blendEquation(i.FUNC_ADD), u = qn, S = qn), Zt) switch (D) {
            case wi:
              i.blendFuncSeparate(i.ONE, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Ve:
              i.blendFunc(i.ONE, i.ONE);
              break;
            case Wo:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Xo:
              i.blendFuncSeparate(i.ZERO, i.SRC_COLOR, i.ZERO, i.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", D);
              break;
          }
          else switch (D) {
            case wi:
              i.blendFuncSeparate(i.SRC_ALPHA, i.ONE_MINUS_SRC_ALPHA, i.ONE, i.ONE_MINUS_SRC_ALPHA);
              break;
            case Ve:
              i.blendFunc(i.SRC_ALPHA, i.ONE);
              break;
            case Wo:
              i.blendFuncSeparate(i.ZERO, i.ONE_MINUS_SRC_COLOR, i.ZERO, i.ONE);
              break;
            case Xo:
              i.blendFunc(i.ZERO, i.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", D);
              break;
          }
          E = null, b = null, N = null, w = null, A.set(0, 0, 0), P = 0, m = D, y = Zt;
        }
        return;
      }
      ct = ct || it, ot = ot || z, Dt = Dt || j, (it !== u || ct !== S) && (i.blendEquationSeparate(Wt[it], Wt[ct]), u = it, S = ct), (z !== E || j !== b || ot !== N || Dt !== w) && (i.blendFuncSeparate(de[z], de[j], de[ot], de[Dt]), E = z, b = j, N = ot, w = Dt), (ce.equals(A) === false || ye !== P) && (i.blendColor(ce.r, ce.g, ce.b, ye), A.copy(ce), P = ye), m = D, y = false;
    }
    function ze(D, it) {
      D.side === Ce ? wt(i.CULL_FACE) : rt(i.CULL_FACE);
      let z = D.side === Ue;
      it && (z = !z), zt(z), D.blending === wi && D.transparent === false ? U(_n) : U(D.blending, D.blendEquation, D.blendSrc, D.blendDst, D.blendEquationAlpha, D.blendSrcAlpha, D.blendDstAlpha, D.blendColor, D.blendAlpha, D.premultipliedAlpha), a.setFunc(D.depthFunc), a.setTest(D.depthTest), a.setMask(D.depthWrite), r.setMask(D.colorWrite);
      const j = D.stencilWrite;
      o.setTest(j), j && (o.setMask(D.stencilWriteMask), o.setFunc(D.stencilFunc, D.stencilRef, D.stencilFuncMask), o.setOp(D.stencilFail, D.stencilZFail, D.stencilZPass)), ie(D.polygonOffset, D.polygonOffsetFactor, D.polygonOffsetUnits), D.alphaToCoverage === true ? rt(i.SAMPLE_ALPHA_TO_COVERAGE) : wt(i.SAMPLE_ALPHA_TO_COVERAGE);
    }
    function zt(D) {
      x !== D && (D ? i.frontFace(i.CW) : i.frontFace(i.CCW), x = D);
    }
    function Ht(D) {
      D !== Bu ? (rt(i.CULL_FACE), D !== R && (D === Vo ? i.cullFace(i.BACK) : D === ku ? i.cullFace(i.FRONT) : i.cullFace(i.FRONT_AND_BACK))) : wt(i.CULL_FACE), R = D;
    }
    function bt(D) {
      D !== G && (V && i.lineWidth(D), G = D);
    }
    function ie(D, it, z) {
      D ? (rt(i.POLYGON_OFFSET_FILL), (k !== it || X !== z) && (i.polygonOffset(it, z), k = it, X = z)) : wt(i.POLYGON_OFFSET_FILL);
    }
    function yt(D) {
      D ? rt(i.SCISSOR_TEST) : wt(i.SCISSOR_TEST);
    }
    function T(D) {
      D === void 0 && (D = i.TEXTURE0 + Z - 1), st !== D && (i.activeTexture(D), st = D);
    }
    function v(D, it, z) {
      z === void 0 && (st === null ? z = i.TEXTURE0 + Z - 1 : z = st);
      let j = ht[z];
      j === void 0 && (j = {
        type: void 0,
        texture: void 0
      }, ht[z] = j), (j.type !== D || j.texture !== it) && (st !== z && (i.activeTexture(z), st = z), i.bindTexture(D, it || vt[D]), j.type = D, j.texture = it);
    }
    function F() {
      const D = ht[st];
      D !== void 0 && D.type !== void 0 && (i.bindTexture(D.type, null), D.type = void 0, D.texture = void 0);
    }
    function q() {
      try {
        i.compressedTexImage2D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function K() {
      try {
        i.compressedTexImage3D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function W() {
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
    function Xt() {
      try {
        i.texStorage2D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function $() {
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
    function Tt() {
      try {
        i.texImage3D.apply(i, arguments);
      } catch (D) {
        console.error("THREE.WebGLState:", D);
      }
    }
    function At(D) {
      te.equals(D) === false && (i.scissor(D.x, D.y, D.z, D.w), te.copy(D));
    }
    function ft(D) {
      Y.equals(D) === false && (i.viewport(D.x, D.y, D.z, D.w), Y.copy(D));
    }
    function Gt(D, it) {
      let z = c.get(it);
      z === void 0 && (z = /* @__PURE__ */ new WeakMap(), c.set(it, z));
      let j = z.get(D);
      j === void 0 && (j = i.getUniformBlockIndex(it, D.name), z.set(D, j));
    }
    function Ut(D, it) {
      const j = c.get(it).get(D);
      l.get(it) !== j && (i.uniformBlockBinding(it, j, D.__bindingPointIndex), l.set(it, j));
    }
    function ee() {
      i.disable(i.BLEND), i.disable(i.CULL_FACE), i.disable(i.DEPTH_TEST), i.disable(i.POLYGON_OFFSET_FILL), i.disable(i.SCISSOR_TEST), i.disable(i.STENCIL_TEST), i.disable(i.SAMPLE_ALPHA_TO_COVERAGE), i.blendEquation(i.FUNC_ADD), i.blendFunc(i.ONE, i.ZERO), i.blendFuncSeparate(i.ONE, i.ZERO, i.ONE, i.ZERO), i.blendColor(0, 0, 0, 0), i.colorMask(true, true, true, true), i.clearColor(0, 0, 0, 0), i.depthMask(true), i.depthFunc(i.LESS), a.setReversed(false), i.clearDepth(1), i.stencilMask(4294967295), i.stencilFunc(i.ALWAYS, 0, 4294967295), i.stencilOp(i.KEEP, i.KEEP, i.KEEP), i.clearStencil(0), i.cullFace(i.BACK), i.frontFace(i.CCW), i.polygonOffset(0, 0), i.activeTexture(i.TEXTURE0), i.bindFramebuffer(i.FRAMEBUFFER, null), i.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), i.bindFramebuffer(i.READ_FRAMEBUFFER, null), i.useProgram(null), i.lineWidth(1), i.scissor(0, 0, i.canvas.width, i.canvas.height), i.viewport(0, 0, i.canvas.width, i.canvas.height), h = {}, st = null, ht = {}, d = {}, f = /* @__PURE__ */ new WeakMap(), p = [], g = null, _ = false, m = null, u = null, E = null, b = null, S = null, N = null, w = null, A = new Et(0, 0, 0), P = 0, y = false, x = null, R = null, G = null, k = null, X = null, te.set(0, 0, i.canvas.width, i.canvas.height), Y.set(0, 0, i.canvas.width, i.canvas.height), r.reset(), a.reset(), o.reset();
    }
    return {
      buffers: {
        color: r,
        depth: a,
        stencil: o
      },
      enable: rt,
      disable: wt,
      bindFramebuffer: Rt,
      drawBuffers: Ot,
      useProgram: oe,
      setBlending: U,
      setMaterial: ze,
      setFlipSided: zt,
      setCullFace: Ht,
      setLineWidth: bt,
      setPolygonOffset: ie,
      setScissorTest: yt,
      activeTexture: T,
      bindTexture: v,
      unbindTexture: F,
      compressedTexImage2D: q,
      compressedTexImage3D: K,
      texImage2D: dt,
      texImage3D: Tt,
      updateUBOMapping: Gt,
      uniformBlockBinding: Ut,
      texStorage2D: Xt,
      texStorage3D: $,
      texSubImage2D: W,
      texSubImage3D: xt,
      compressedTexSubImage2D: at,
      compressedTexSubImage3D: ut,
      scissor: At,
      viewport: ft,
      reset: ee
    };
  }
  function zl(i, t, e, n) {
    const s = N_(n);
    switch (e) {
      case Xc:
        return i * t;
      case qc:
        return i * t;
      case jc:
        return i * t * 2;
      case ro:
        return i * t / s.components * s.byteLength;
      case ao:
        return i * t / s.components * s.byteLength;
      case Kc:
        return i * t * 2 / s.components * s.byteLength;
      case oo:
        return i * t * 2 / s.components * s.byteLength;
      case Yc:
        return i * t * 3 / s.components * s.byteLength;
      case $e:
        return i * t * 4 / s.components * s.byteLength;
      case lo:
        return i * t * 4 / s.components * s.byteLength;
      case Vs:
      case Ws:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
      case Xs:
      case Ys:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
      case ga:
      case va:
        return Math.max(i, 16) * Math.max(t, 8) / 4;
      case ma:
      case _a:
        return Math.max(i, 8) * Math.max(t, 8) / 2;
      case xa:
      case Ma:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 8;
      case Sa:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
      case ya:
        return Math.floor((i + 3) / 4) * Math.floor((t + 3) / 4) * 16;
      case Ea:
        return Math.floor((i + 4) / 5) * Math.floor((t + 3) / 4) * 16;
      case ba:
        return Math.floor((i + 4) / 5) * Math.floor((t + 4) / 5) * 16;
      case Ta:
        return Math.floor((i + 5) / 6) * Math.floor((t + 4) / 5) * 16;
      case wa:
        return Math.floor((i + 5) / 6) * Math.floor((t + 5) / 6) * 16;
      case Aa:
        return Math.floor((i + 7) / 8) * Math.floor((t + 4) / 5) * 16;
      case Ca:
        return Math.floor((i + 7) / 8) * Math.floor((t + 5) / 6) * 16;
      case Ra:
        return Math.floor((i + 7) / 8) * Math.floor((t + 7) / 8) * 16;
      case Pa:
        return Math.floor((i + 9) / 10) * Math.floor((t + 4) / 5) * 16;
      case Da:
        return Math.floor((i + 9) / 10) * Math.floor((t + 5) / 6) * 16;
      case La:
        return Math.floor((i + 9) / 10) * Math.floor((t + 7) / 8) * 16;
      case Ia:
        return Math.floor((i + 9) / 10) * Math.floor((t + 9) / 10) * 16;
      case Ua:
        return Math.floor((i + 11) / 12) * Math.floor((t + 9) / 10) * 16;
      case Na:
        return Math.floor((i + 11) / 12) * Math.floor((t + 11) / 12) * 16;
      case qs:
      case Fa:
      case Oa:
        return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
      case Zc:
      case Ba:
        return Math.ceil(i / 4) * Math.ceil(t / 4) * 8;
      case ka:
      case za:
        return Math.ceil(i / 4) * Math.ceil(t / 4) * 16;
    }
    throw new Error(`Unable to determine texture byte length for ${e} format.`);
  }
  function N_(i) {
    switch (i) {
      case Sn:
      case Gc:
        return {
          byteLength: 1,
          components: 1
        };
      case ss:
      case Vc:
      case vn:
        return {
          byteLength: 2,
          components: 1
        };
      case io:
      case so:
        return {
          byteLength: 2,
          components: 4
        };
      case Jn:
      case no:
      case nn:
        return {
          byteLength: 4,
          components: 1
        };
      case Wc:
        return {
          byteLength: 4,
          components: 3
        };
    }
    throw new Error(`Unknown texture type ${i}.`);
  }
  function F_(i, t, e, n, s, r, a) {
    const o = t.has("WEBGL_multisampled_render_to_texture") ? t.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? false : /OculusBrowser/g.test(navigator.userAgent), c = new _t(), h = /* @__PURE__ */ new WeakMap();
    let d;
    const f = /* @__PURE__ */ new WeakMap();
    let p = false;
    try {
      p = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
    } catch {
    }
    function g(T, v) {
      return p ? new OffscreenCanvas(T, v) : Zs("canvas");
    }
    function _(T, v, F) {
      let q = 1;
      const K = yt(T);
      if ((K.width > F || K.height > F) && (q = F / Math.max(K.width, K.height)), q < 1) if (typeof HTMLImageElement < "u" && T instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && T instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && T instanceof ImageBitmap || typeof VideoFrame < "u" && T instanceof VideoFrame) {
        const W = Math.floor(q * K.width), xt = Math.floor(q * K.height);
        d === void 0 && (d = g(W, xt));
        const at = v ? g(W, xt) : d;
        return at.width = W, at.height = xt, at.getContext("2d").drawImage(T, 0, 0, W, xt), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + K.width + "x" + K.height + ") to (" + W + "x" + xt + ")."), at;
      } else return "data" in T && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + K.width + "x" + K.height + ")."), T;
      return T;
    }
    function m(T) {
      return T.generateMipmaps;
    }
    function u(T) {
      i.generateMipmap(T);
    }
    function E(T) {
      return T.isWebGLCubeRenderTarget ? i.TEXTURE_CUBE_MAP : T.isWebGL3DRenderTarget ? i.TEXTURE_3D : T.isWebGLArrayRenderTarget || T.isCompressedArrayTexture ? i.TEXTURE_2D_ARRAY : i.TEXTURE_2D;
    }
    function b(T, v, F, q, K = false) {
      if (T !== null) {
        if (i[T] !== void 0) return i[T];
        console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + T + "'");
      }
      let W = v;
      if (v === i.RED && (F === i.FLOAT && (W = i.R32F), F === i.HALF_FLOAT && (W = i.R16F), F === i.UNSIGNED_BYTE && (W = i.R8)), v === i.RED_INTEGER && (F === i.UNSIGNED_BYTE && (W = i.R8UI), F === i.UNSIGNED_SHORT && (W = i.R16UI), F === i.UNSIGNED_INT && (W = i.R32UI), F === i.BYTE && (W = i.R8I), F === i.SHORT && (W = i.R16I), F === i.INT && (W = i.R32I)), v === i.RG && (F === i.FLOAT && (W = i.RG32F), F === i.HALF_FLOAT && (W = i.RG16F), F === i.UNSIGNED_BYTE && (W = i.RG8)), v === i.RG_INTEGER && (F === i.UNSIGNED_BYTE && (W = i.RG8UI), F === i.UNSIGNED_SHORT && (W = i.RG16UI), F === i.UNSIGNED_INT && (W = i.RG32UI), F === i.BYTE && (W = i.RG8I), F === i.SHORT && (W = i.RG16I), F === i.INT && (W = i.RG32I)), v === i.RGB_INTEGER && (F === i.UNSIGNED_BYTE && (W = i.RGB8UI), F === i.UNSIGNED_SHORT && (W = i.RGB16UI), F === i.UNSIGNED_INT && (W = i.RGB32UI), F === i.BYTE && (W = i.RGB8I), F === i.SHORT && (W = i.RGB16I), F === i.INT && (W = i.RGB32I)), v === i.RGBA_INTEGER && (F === i.UNSIGNED_BYTE && (W = i.RGBA8UI), F === i.UNSIGNED_SHORT && (W = i.RGBA16UI), F === i.UNSIGNED_INT && (W = i.RGBA32UI), F === i.BYTE && (W = i.RGBA8I), F === i.SHORT && (W = i.RGBA16I), F === i.INT && (W = i.RGBA32I)), v === i.RGB && F === i.UNSIGNED_INT_5_9_9_9_REV && (W = i.RGB9_E5), v === i.RGBA) {
        const xt = K ? lr : Vt.getTransfer(q);
        F === i.FLOAT && (W = i.RGBA32F), F === i.HALF_FLOAT && (W = i.RGBA16F), F === i.UNSIGNED_BYTE && (W = xt === $t ? i.SRGB8_ALPHA8 : i.RGBA8), F === i.UNSIGNED_SHORT_4_4_4_4 && (W = i.RGBA4), F === i.UNSIGNED_SHORT_5_5_5_1 && (W = i.RGB5_A1);
      }
      return (W === i.R16F || W === i.R32F || W === i.RG16F || W === i.RG32F || W === i.RGBA16F || W === i.RGBA32F) && t.get("EXT_color_buffer_float"), W;
    }
    function S(T, v) {
      let F;
      return T ? v === null || v === Jn || v === Li ? F = i.DEPTH24_STENCIL8 : v === nn ? F = i.DEPTH32F_STENCIL8 : v === ss && (F = i.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : v === null || v === Jn || v === Li ? F = i.DEPTH_COMPONENT24 : v === nn ? F = i.DEPTH_COMPONENT32F : v === ss && (F = i.DEPTH_COMPONENT16), F;
    }
    function N(T, v) {
      return m(T) === true || T.isFramebufferTexture && T.minFilter !== ke && T.minFilter !== en ? Math.log2(Math.max(v.width, v.height)) + 1 : T.mipmaps !== void 0 && T.mipmaps.length > 0 ? T.mipmaps.length : T.isCompressedTexture && Array.isArray(T.image) ? v.mipmaps.length : 1;
    }
    function w(T) {
      const v = T.target;
      v.removeEventListener("dispose", w), P(v), v.isVideoTexture && h.delete(v);
    }
    function A(T) {
      const v = T.target;
      v.removeEventListener("dispose", A), x(v);
    }
    function P(T) {
      const v = n.get(T);
      if (v.__webglInit === void 0) return;
      const F = T.source, q = f.get(F);
      if (q) {
        const K = q[v.__cacheKey];
        K.usedTimes--, K.usedTimes === 0 && y(T), Object.keys(q).length === 0 && f.delete(F);
      }
      n.remove(T);
    }
    function y(T) {
      const v = n.get(T);
      i.deleteTexture(v.__webglTexture);
      const F = T.source, q = f.get(F);
      delete q[v.__cacheKey], a.memory.textures--;
    }
    function x(T) {
      const v = n.get(T);
      if (T.depthTexture && (T.depthTexture.dispose(), n.remove(T.depthTexture)), T.isWebGLCubeRenderTarget) for (let q = 0; q < 6; q++) {
        if (Array.isArray(v.__webglFramebuffer[q])) for (let K = 0; K < v.__webglFramebuffer[q].length; K++) i.deleteFramebuffer(v.__webglFramebuffer[q][K]);
        else i.deleteFramebuffer(v.__webglFramebuffer[q]);
        v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer[q]);
      }
      else {
        if (Array.isArray(v.__webglFramebuffer)) for (let q = 0; q < v.__webglFramebuffer.length; q++) i.deleteFramebuffer(v.__webglFramebuffer[q]);
        else i.deleteFramebuffer(v.__webglFramebuffer);
        if (v.__webglDepthbuffer && i.deleteRenderbuffer(v.__webglDepthbuffer), v.__webglMultisampledFramebuffer && i.deleteFramebuffer(v.__webglMultisampledFramebuffer), v.__webglColorRenderbuffer) for (let q = 0; q < v.__webglColorRenderbuffer.length; q++) v.__webglColorRenderbuffer[q] && i.deleteRenderbuffer(v.__webglColorRenderbuffer[q]);
        v.__webglDepthRenderbuffer && i.deleteRenderbuffer(v.__webglDepthRenderbuffer);
      }
      const F = T.textures;
      for (let q = 0, K = F.length; q < K; q++) {
        const W = n.get(F[q]);
        W.__webglTexture && (i.deleteTexture(W.__webglTexture), a.memory.textures--), n.remove(F[q]);
      }
      n.remove(T);
    }
    let R = 0;
    function G() {
      R = 0;
    }
    function k() {
      const T = R;
      return T >= s.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + T + " texture units while this GPU supports only " + s.maxTextures), R += 1, T;
    }
    function X(T) {
      const v = [];
      return v.push(T.wrapS), v.push(T.wrapT), v.push(T.wrapR || 0), v.push(T.magFilter), v.push(T.minFilter), v.push(T.anisotropy), v.push(T.internalFormat), v.push(T.format), v.push(T.type), v.push(T.generateMipmaps), v.push(T.premultiplyAlpha), v.push(T.flipY), v.push(T.unpackAlignment), v.push(T.colorSpace), v.join();
    }
    function Z(T, v) {
      const F = n.get(T);
      if (T.isVideoTexture && bt(T), T.isRenderTargetTexture === false && T.version > 0 && F.__version !== T.version) {
        const q = T.image;
        if (q === null) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
        else if (q.complete === false) console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
        else {
          Y(F, T, v);
          return;
        }
      }
      e.bindTexture(i.TEXTURE_2D, F.__webglTexture, i.TEXTURE0 + v);
    }
    function V(T, v) {
      const F = n.get(T);
      if (T.version > 0 && F.__version !== T.version) {
        Y(F, T, v);
        return;
      }
      e.bindTexture(i.TEXTURE_2D_ARRAY, F.__webglTexture, i.TEXTURE0 + v);
    }
    function Q(T, v) {
      const F = n.get(T);
      if (T.version > 0 && F.__version !== T.version) {
        Y(F, T, v);
        return;
      }
      e.bindTexture(i.TEXTURE_3D, F.__webglTexture, i.TEXTURE0 + v);
    }
    function H(T, v) {
      const F = n.get(T);
      if (T.version > 0 && F.__version !== T.version) {
        tt(F, T, v);
        return;
      }
      e.bindTexture(i.TEXTURE_CUBE_MAP, F.__webglTexture, i.TEXTURE0 + v);
    }
    const st = {
      [fa]: i.REPEAT,
      [Kn]: i.CLAMP_TO_EDGE,
      [pa]: i.MIRRORED_REPEAT
    }, ht = {
      [ke]: i.NEAREST,
      [ld]: i.NEAREST_MIPMAP_NEAREST,
      [ds]: i.NEAREST_MIPMAP_LINEAR,
      [en]: i.LINEAR,
      [gr]: i.LINEAR_MIPMAP_NEAREST,
      [Zn]: i.LINEAR_MIPMAP_LINEAR
    }, St = {
      [dd]: i.NEVER,
      [vd]: i.ALWAYS,
      [fd]: i.LESS,
      [Jc]: i.LEQUAL,
      [pd]: i.EQUAL,
      [_d]: i.GEQUAL,
      [md]: i.GREATER,
      [gd]: i.NOTEQUAL
    };
    function Ft(T, v) {
      if (v.type === nn && t.has("OES_texture_float_linear") === false && (v.magFilter === en || v.magFilter === gr || v.magFilter === ds || v.magFilter === Zn || v.minFilter === en || v.minFilter === gr || v.minFilter === ds || v.minFilter === Zn) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), i.texParameteri(T, i.TEXTURE_WRAP_S, st[v.wrapS]), i.texParameteri(T, i.TEXTURE_WRAP_T, st[v.wrapT]), (T === i.TEXTURE_3D || T === i.TEXTURE_2D_ARRAY) && i.texParameteri(T, i.TEXTURE_WRAP_R, st[v.wrapR]), i.texParameteri(T, i.TEXTURE_MAG_FILTER, ht[v.magFilter]), i.texParameteri(T, i.TEXTURE_MIN_FILTER, ht[v.minFilter]), v.compareFunction && (i.texParameteri(T, i.TEXTURE_COMPARE_MODE, i.COMPARE_REF_TO_TEXTURE), i.texParameteri(T, i.TEXTURE_COMPARE_FUNC, St[v.compareFunction])), t.has("EXT_texture_filter_anisotropic") === true) {
        if (v.magFilter === ke || v.minFilter !== ds && v.minFilter !== Zn || v.type === nn && t.has("OES_texture_float_linear") === false) return;
        if (v.anisotropy > 1 || n.get(v).__currentAnisotropy) {
          const F = t.get("EXT_texture_filter_anisotropic");
          i.texParameterf(T, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(v.anisotropy, s.getMaxAnisotropy())), n.get(v).__currentAnisotropy = v.anisotropy;
        }
      }
    }
    function te(T, v) {
      let F = false;
      T.__webglInit === void 0 && (T.__webglInit = true, v.addEventListener("dispose", w));
      const q = v.source;
      let K = f.get(q);
      K === void 0 && (K = {}, f.set(q, K));
      const W = X(v);
      if (W !== T.__cacheKey) {
        K[W] === void 0 && (K[W] = {
          texture: i.createTexture(),
          usedTimes: 0
        }, a.memory.textures++, F = true), K[W].usedTimes++;
        const xt = K[T.__cacheKey];
        xt !== void 0 && (K[T.__cacheKey].usedTimes--, xt.usedTimes === 0 && y(v)), T.__cacheKey = W, T.__webglTexture = K[W].texture;
      }
      return F;
    }
    function Y(T, v, F) {
      let q = i.TEXTURE_2D;
      (v.isDataArrayTexture || v.isCompressedArrayTexture) && (q = i.TEXTURE_2D_ARRAY), v.isData3DTexture && (q = i.TEXTURE_3D);
      const K = te(T, v), W = v.source;
      e.bindTexture(q, T.__webglTexture, i.TEXTURE0 + F);
      const xt = n.get(W);
      if (W.version !== xt.__version || K === true) {
        e.activeTexture(i.TEXTURE0 + F);
        const at = Vt.getPrimaries(Vt.workingColorSpace), ut = v.colorSpace === In ? null : Vt.getPrimaries(v.colorSpace), Xt = v.colorSpace === In || at === ut ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
        i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, Xt);
        let $ = _(v.image, false, s.maxTextureSize);
        $ = ie(v, $);
        const dt = r.convert(v.format, v.colorSpace), Tt = r.convert(v.type);
        let At = b(v.internalFormat, dt, Tt, v.colorSpace, v.isVideoTexture);
        Ft(q, v);
        let ft;
        const Gt = v.mipmaps, Ut = v.isVideoTexture !== true, ee = xt.__version === void 0 || K === true, D = W.dataReady, it = N(v, $);
        if (v.isDepthTexture) At = S(v.format === Ii, v.type), ee && (Ut ? e.texStorage2D(i.TEXTURE_2D, 1, At, $.width, $.height) : e.texImage2D(i.TEXTURE_2D, 0, At, $.width, $.height, 0, dt, Tt, null));
        else if (v.isDataTexture) if (Gt.length > 0) {
          Ut && ee && e.texStorage2D(i.TEXTURE_2D, it, At, Gt[0].width, Gt[0].height);
          for (let z = 0, j = Gt.length; z < j; z++) ft = Gt[z], Ut ? D && e.texSubImage2D(i.TEXTURE_2D, z, 0, 0, ft.width, ft.height, dt, Tt, ft.data) : e.texImage2D(i.TEXTURE_2D, z, At, ft.width, ft.height, 0, dt, Tt, ft.data);
          v.generateMipmaps = false;
        } else Ut ? (ee && e.texStorage2D(i.TEXTURE_2D, it, At, $.width, $.height), D && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, $.width, $.height, dt, Tt, $.data)) : e.texImage2D(i.TEXTURE_2D, 0, At, $.width, $.height, 0, dt, Tt, $.data);
        else if (v.isCompressedTexture) if (v.isCompressedArrayTexture) {
          Ut && ee && e.texStorage3D(i.TEXTURE_2D_ARRAY, it, At, Gt[0].width, Gt[0].height, $.depth);
          for (let z = 0, j = Gt.length; z < j; z++) if (ft = Gt[z], v.format !== $e) if (dt !== null) if (Ut) {
            if (D) if (v.layerUpdates.size > 0) {
              const ct = zl(ft.width, ft.height, v.format, v.type);
              for (const ot of v.layerUpdates) {
                const Dt = ft.data.subarray(ot * ct / ft.data.BYTES_PER_ELEMENT, (ot + 1) * ct / ft.data.BYTES_PER_ELEMENT);
                e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, ot, ft.width, ft.height, 1, dt, Dt);
              }
              v.clearLayerUpdates();
            } else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, 0, ft.width, ft.height, $.depth, dt, ft.data);
          } else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY, z, At, ft.width, ft.height, $.depth, 0, ft.data, 0, 0);
          else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
          else Ut ? D && e.texSubImage3D(i.TEXTURE_2D_ARRAY, z, 0, 0, 0, ft.width, ft.height, $.depth, dt, Tt, ft.data) : e.texImage3D(i.TEXTURE_2D_ARRAY, z, At, ft.width, ft.height, $.depth, 0, dt, Tt, ft.data);
        } else {
          Ut && ee && e.texStorage2D(i.TEXTURE_2D, it, At, Gt[0].width, Gt[0].height);
          for (let z = 0, j = Gt.length; z < j; z++) ft = Gt[z], v.format !== $e ? dt !== null ? Ut ? D && e.compressedTexSubImage2D(i.TEXTURE_2D, z, 0, 0, ft.width, ft.height, dt, ft.data) : e.compressedTexImage2D(i.TEXTURE_2D, z, At, ft.width, ft.height, 0, ft.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : Ut ? D && e.texSubImage2D(i.TEXTURE_2D, z, 0, 0, ft.width, ft.height, dt, Tt, ft.data) : e.texImage2D(i.TEXTURE_2D, z, At, ft.width, ft.height, 0, dt, Tt, ft.data);
        }
        else if (v.isDataArrayTexture) if (Ut) {
          if (ee && e.texStorage3D(i.TEXTURE_2D_ARRAY, it, At, $.width, $.height, $.depth), D) if (v.layerUpdates.size > 0) {
            const z = zl($.width, $.height, v.format, v.type);
            for (const j of v.layerUpdates) {
              const ct = $.data.subarray(j * z / $.data.BYTES_PER_ELEMENT, (j + 1) * z / $.data.BYTES_PER_ELEMENT);
              e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, j, $.width, $.height, 1, dt, Tt, ct);
            }
            v.clearLayerUpdates();
          } else e.texSubImage3D(i.TEXTURE_2D_ARRAY, 0, 0, 0, 0, $.width, $.height, $.depth, dt, Tt, $.data);
        } else e.texImage3D(i.TEXTURE_2D_ARRAY, 0, At, $.width, $.height, $.depth, 0, dt, Tt, $.data);
        else if (v.isData3DTexture) Ut ? (ee && e.texStorage3D(i.TEXTURE_3D, it, At, $.width, $.height, $.depth), D && e.texSubImage3D(i.TEXTURE_3D, 0, 0, 0, 0, $.width, $.height, $.depth, dt, Tt, $.data)) : e.texImage3D(i.TEXTURE_3D, 0, At, $.width, $.height, $.depth, 0, dt, Tt, $.data);
        else if (v.isFramebufferTexture) {
          if (ee) if (Ut) e.texStorage2D(i.TEXTURE_2D, it, At, $.width, $.height);
          else {
            let z = $.width, j = $.height;
            for (let ct = 0; ct < it; ct++) e.texImage2D(i.TEXTURE_2D, ct, At, z, j, 0, dt, Tt, null), z >>= 1, j >>= 1;
          }
        } else if (Gt.length > 0) {
          if (Ut && ee) {
            const z = yt(Gt[0]);
            e.texStorage2D(i.TEXTURE_2D, it, At, z.width, z.height);
          }
          for (let z = 0, j = Gt.length; z < j; z++) ft = Gt[z], Ut ? D && e.texSubImage2D(i.TEXTURE_2D, z, 0, 0, dt, Tt, ft) : e.texImage2D(i.TEXTURE_2D, z, At, dt, Tt, ft);
          v.generateMipmaps = false;
        } else if (Ut) {
          if (ee) {
            const z = yt($);
            e.texStorage2D(i.TEXTURE_2D, it, At, z.width, z.height);
          }
          D && e.texSubImage2D(i.TEXTURE_2D, 0, 0, 0, dt, Tt, $);
        } else e.texImage2D(i.TEXTURE_2D, 0, At, dt, Tt, $);
        m(v) && u(q), xt.__version = W.version, v.onUpdate && v.onUpdate(v);
      }
      T.__version = v.version;
    }
    function tt(T, v, F) {
      if (v.image.length !== 6) return;
      const q = te(T, v), K = v.source;
      e.bindTexture(i.TEXTURE_CUBE_MAP, T.__webglTexture, i.TEXTURE0 + F);
      const W = n.get(K);
      if (K.version !== W.__version || q === true) {
        e.activeTexture(i.TEXTURE0 + F);
        const xt = Vt.getPrimaries(Vt.workingColorSpace), at = v.colorSpace === In ? null : Vt.getPrimaries(v.colorSpace), ut = v.colorSpace === In || xt === at ? i.NONE : i.BROWSER_DEFAULT_WEBGL;
        i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL, v.flipY), i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), i.pixelStorei(i.UNPACK_ALIGNMENT, v.unpackAlignment), i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL, ut);
        const Xt = v.isCompressedTexture || v.image[0].isCompressedTexture, $ = v.image[0] && v.image[0].isDataTexture, dt = [];
        for (let j = 0; j < 6; j++) !Xt && !$ ? dt[j] = _(v.image[j], true, s.maxCubemapSize) : dt[j] = $ ? v.image[j].image : v.image[j], dt[j] = ie(v, dt[j]);
        const Tt = dt[0], At = r.convert(v.format, v.colorSpace), ft = r.convert(v.type), Gt = b(v.internalFormat, At, ft, v.colorSpace), Ut = v.isVideoTexture !== true, ee = W.__version === void 0 || q === true, D = K.dataReady;
        let it = N(v, Tt);
        Ft(i.TEXTURE_CUBE_MAP, v);
        let z;
        if (Xt) {
          Ut && ee && e.texStorage2D(i.TEXTURE_CUBE_MAP, it, Gt, Tt.width, Tt.height);
          for (let j = 0; j < 6; j++) {
            z = dt[j].mipmaps;
            for (let ct = 0; ct < z.length; ct++) {
              const ot = z[ct];
              v.format !== $e ? At !== null ? Ut ? D && e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct, 0, 0, ot.width, ot.height, At, ot.data) : e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct, Gt, ot.width, ot.height, 0, ot.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Ut ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct, 0, 0, ot.width, ot.height, At, ft, ot.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct, Gt, ot.width, ot.height, 0, At, ft, ot.data);
            }
          }
        } else {
          if (z = v.mipmaps, Ut && ee) {
            z.length > 0 && it++;
            const j = yt(dt[0]);
            e.texStorage2D(i.TEXTURE_CUBE_MAP, it, Gt, j.width, j.height);
          }
          for (let j = 0; j < 6; j++) if ($) {
            Ut ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, 0, 0, dt[j].width, dt[j].height, At, ft, dt[j].data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, Gt, dt[j].width, dt[j].height, 0, At, ft, dt[j].data);
            for (let ct = 0; ct < z.length; ct++) {
              const Dt = z[ct].image[j].image;
              Ut ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct + 1, 0, 0, Dt.width, Dt.height, At, ft, Dt.data) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct + 1, Gt, Dt.width, Dt.height, 0, At, ft, Dt.data);
            }
          } else {
            Ut ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, 0, 0, At, ft, dt[j]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, 0, Gt, At, ft, dt[j]);
            for (let ct = 0; ct < z.length; ct++) {
              const ot = z[ct];
              Ut ? D && e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct + 1, 0, 0, At, ft, ot.image[j]) : e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X + j, ct + 1, Gt, At, ft, ot.image[j]);
            }
          }
        }
        m(v) && u(i.TEXTURE_CUBE_MAP), W.__version = K.version, v.onUpdate && v.onUpdate(v);
      }
      T.__version = v.version;
    }
    function vt(T, v, F, q, K, W) {
      const xt = r.convert(F.format, F.colorSpace), at = r.convert(F.type), ut = b(F.internalFormat, xt, at, F.colorSpace), Xt = n.get(v), $ = n.get(F);
      if ($.__renderTarget = v, !Xt.__hasExternalTextures) {
        const dt = Math.max(1, v.width >> W), Tt = Math.max(1, v.height >> W);
        K === i.TEXTURE_3D || K === i.TEXTURE_2D_ARRAY ? e.texImage3D(K, W, ut, dt, Tt, v.depth, 0, xt, at, null) : e.texImage2D(K, W, ut, dt, Tt, 0, xt, at, null);
      }
      e.bindFramebuffer(i.FRAMEBUFFER, T), Ht(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, q, K, $.__webglTexture, 0, zt(v)) : (K === i.TEXTURE_2D || K >= i.TEXTURE_CUBE_MAP_POSITIVE_X && K <= i.TEXTURE_CUBE_MAP_NEGATIVE_Z) && i.framebufferTexture2D(i.FRAMEBUFFER, q, K, $.__webglTexture, W), e.bindFramebuffer(i.FRAMEBUFFER, null);
    }
    function rt(T, v, F) {
      if (i.bindRenderbuffer(i.RENDERBUFFER, T), v.depthBuffer) {
        const q = v.depthTexture, K = q && q.isDepthTexture ? q.type : null, W = S(v.stencilBuffer, K), xt = v.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, at = zt(v);
        Ht(v) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, at, W, v.width, v.height) : F ? i.renderbufferStorageMultisample(i.RENDERBUFFER, at, W, v.width, v.height) : i.renderbufferStorage(i.RENDERBUFFER, W, v.width, v.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, xt, i.RENDERBUFFER, T);
      } else {
        const q = v.textures;
        for (let K = 0; K < q.length; K++) {
          const W = q[K], xt = r.convert(W.format, W.colorSpace), at = r.convert(W.type), ut = b(W.internalFormat, xt, at, W.colorSpace), Xt = zt(v);
          F && Ht(v) === false ? i.renderbufferStorageMultisample(i.RENDERBUFFER, Xt, ut, v.width, v.height) : Ht(v) ? o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER, Xt, ut, v.width, v.height) : i.renderbufferStorage(i.RENDERBUFFER, ut, v.width, v.height);
        }
      }
      i.bindRenderbuffer(i.RENDERBUFFER, null);
    }
    function wt(T, v) {
      if (v && v.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
      if (e.bindFramebuffer(i.FRAMEBUFFER, T), !(v.depthTexture && v.depthTexture.isDepthTexture)) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
      const q = n.get(v.depthTexture);
      q.__renderTarget = v, (!q.__webglTexture || v.depthTexture.image.width !== v.width || v.depthTexture.image.height !== v.height) && (v.depthTexture.image.width = v.width, v.depthTexture.image.height = v.height, v.depthTexture.needsUpdate = true), Z(v.depthTexture, 0);
      const K = q.__webglTexture, W = zt(v);
      if (v.depthTexture.format === Ai) Ht(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, K, 0, W) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_ATTACHMENT, i.TEXTURE_2D, K, 0);
      else if (v.depthTexture.format === Ii) Ht(v) ? o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, K, 0, W) : i.framebufferTexture2D(i.FRAMEBUFFER, i.DEPTH_STENCIL_ATTACHMENT, i.TEXTURE_2D, K, 0);
      else throw new Error("Unknown depthTexture format");
    }
    function Rt(T) {
      const v = n.get(T), F = T.isWebGLCubeRenderTarget === true;
      if (v.__boundDepthTexture !== T.depthTexture) {
        const q = T.depthTexture;
        if (v.__depthDisposeCallback && v.__depthDisposeCallback(), q) {
          const K = () => {
            delete v.__boundDepthTexture, delete v.__depthDisposeCallback, q.removeEventListener("dispose", K);
          };
          q.addEventListener("dispose", K), v.__depthDisposeCallback = K;
        }
        v.__boundDepthTexture = q;
      }
      if (T.depthTexture && !v.__autoAllocateDepthBuffer) {
        if (F) throw new Error("target.depthTexture not supported in Cube render targets");
        wt(v.__webglFramebuffer, T);
      } else if (F) {
        v.__webglDepthbuffer = [];
        for (let q = 0; q < 6; q++) if (e.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer[q]), v.__webglDepthbuffer[q] === void 0) v.__webglDepthbuffer[q] = i.createRenderbuffer(), rt(v.__webglDepthbuffer[q], T, false);
        else {
          const K = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, W = v.__webglDepthbuffer[q];
          i.bindRenderbuffer(i.RENDERBUFFER, W), i.framebufferRenderbuffer(i.FRAMEBUFFER, K, i.RENDERBUFFER, W);
        }
      } else if (e.bindFramebuffer(i.FRAMEBUFFER, v.__webglFramebuffer), v.__webglDepthbuffer === void 0) v.__webglDepthbuffer = i.createRenderbuffer(), rt(v.__webglDepthbuffer, T, false);
      else {
        const q = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, K = v.__webglDepthbuffer;
        i.bindRenderbuffer(i.RENDERBUFFER, K), i.framebufferRenderbuffer(i.FRAMEBUFFER, q, i.RENDERBUFFER, K);
      }
      e.bindFramebuffer(i.FRAMEBUFFER, null);
    }
    function Ot(T, v, F) {
      const q = n.get(T);
      v !== void 0 && vt(q.__webglFramebuffer, T, T.texture, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, 0), F !== void 0 && Rt(T);
    }
    function oe(T) {
      const v = T.texture, F = n.get(T), q = n.get(v);
      T.addEventListener("dispose", A);
      const K = T.textures, W = T.isWebGLCubeRenderTarget === true, xt = K.length > 1;
      if (xt || (q.__webglTexture === void 0 && (q.__webglTexture = i.createTexture()), q.__version = v.version, a.memory.textures++), W) {
        F.__webglFramebuffer = [];
        for (let at = 0; at < 6; at++) if (v.mipmaps && v.mipmaps.length > 0) {
          F.__webglFramebuffer[at] = [];
          for (let ut = 0; ut < v.mipmaps.length; ut++) F.__webglFramebuffer[at][ut] = i.createFramebuffer();
        } else F.__webglFramebuffer[at] = i.createFramebuffer();
      } else {
        if (v.mipmaps && v.mipmaps.length > 0) {
          F.__webglFramebuffer = [];
          for (let at = 0; at < v.mipmaps.length; at++) F.__webglFramebuffer[at] = i.createFramebuffer();
        } else F.__webglFramebuffer = i.createFramebuffer();
        if (xt) for (let at = 0, ut = K.length; at < ut; at++) {
          const Xt = n.get(K[at]);
          Xt.__webglTexture === void 0 && (Xt.__webglTexture = i.createTexture(), a.memory.textures++);
        }
        if (T.samples > 0 && Ht(T) === false) {
          F.__webglMultisampledFramebuffer = i.createFramebuffer(), F.__webglColorRenderbuffer = [], e.bindFramebuffer(i.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
          for (let at = 0; at < K.length; at++) {
            const ut = K[at];
            F.__webglColorRenderbuffer[at] = i.createRenderbuffer(), i.bindRenderbuffer(i.RENDERBUFFER, F.__webglColorRenderbuffer[at]);
            const Xt = r.convert(ut.format, ut.colorSpace), $ = r.convert(ut.type), dt = b(ut.internalFormat, Xt, $, ut.colorSpace, T.isXRRenderTarget === true), Tt = zt(T);
            i.renderbufferStorageMultisample(i.RENDERBUFFER, Tt, dt, T.width, T.height), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + at, i.RENDERBUFFER, F.__webglColorRenderbuffer[at]);
          }
          i.bindRenderbuffer(i.RENDERBUFFER, null), T.depthBuffer && (F.__webglDepthRenderbuffer = i.createRenderbuffer(), rt(F.__webglDepthRenderbuffer, T, true)), e.bindFramebuffer(i.FRAMEBUFFER, null);
        }
      }
      if (W) {
        e.bindTexture(i.TEXTURE_CUBE_MAP, q.__webglTexture), Ft(i.TEXTURE_CUBE_MAP, v);
        for (let at = 0; at < 6; at++) if (v.mipmaps && v.mipmaps.length > 0) for (let ut = 0; ut < v.mipmaps.length; ut++) vt(F.__webglFramebuffer[at][ut], T, v, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, ut);
        else vt(F.__webglFramebuffer[at], T, v, i.COLOR_ATTACHMENT0, i.TEXTURE_CUBE_MAP_POSITIVE_X + at, 0);
        m(v) && u(i.TEXTURE_CUBE_MAP), e.unbindTexture();
      } else if (xt) {
        for (let at = 0, ut = K.length; at < ut; at++) {
          const Xt = K[at], $ = n.get(Xt);
          e.bindTexture(i.TEXTURE_2D, $.__webglTexture), Ft(i.TEXTURE_2D, Xt), vt(F.__webglFramebuffer, T, Xt, i.COLOR_ATTACHMENT0 + at, i.TEXTURE_2D, 0), m(Xt) && u(i.TEXTURE_2D);
        }
        e.unbindTexture();
      } else {
        let at = i.TEXTURE_2D;
        if ((T.isWebGL3DRenderTarget || T.isWebGLArrayRenderTarget) && (at = T.isWebGL3DRenderTarget ? i.TEXTURE_3D : i.TEXTURE_2D_ARRAY), e.bindTexture(at, q.__webglTexture), Ft(at, v), v.mipmaps && v.mipmaps.length > 0) for (let ut = 0; ut < v.mipmaps.length; ut++) vt(F.__webglFramebuffer[ut], T, v, i.COLOR_ATTACHMENT0, at, ut);
        else vt(F.__webglFramebuffer, T, v, i.COLOR_ATTACHMENT0, at, 0);
        m(v) && u(at), e.unbindTexture();
      }
      T.depthBuffer && Rt(T);
    }
    function Wt(T) {
      const v = T.textures;
      for (let F = 0, q = v.length; F < q; F++) {
        const K = v[F];
        if (m(K)) {
          const W = E(T), xt = n.get(K).__webglTexture;
          e.bindTexture(W, xt), u(W), e.unbindTexture();
        }
      }
    }
    const de = [], U = [];
    function ze(T) {
      if (T.samples > 0) {
        if (Ht(T) === false) {
          const v = T.textures, F = T.width, q = T.height;
          let K = i.COLOR_BUFFER_BIT;
          const W = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT, xt = n.get(T), at = v.length > 1;
          if (at) for (let ut = 0; ut < v.length; ut++) e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.RENDERBUFFER, null), e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.TEXTURE_2D, null, 0);
          e.bindFramebuffer(i.READ_FRAMEBUFFER, xt.__webglMultisampledFramebuffer), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, xt.__webglFramebuffer);
          for (let ut = 0; ut < v.length; ut++) {
            if (T.resolveDepthBuffer && (T.depthBuffer && (K |= i.DEPTH_BUFFER_BIT), T.stencilBuffer && T.resolveStencilBuffer && (K |= i.STENCIL_BUFFER_BIT)), at) {
              i.framebufferRenderbuffer(i.READ_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.RENDERBUFFER, xt.__webglColorRenderbuffer[ut]);
              const Xt = n.get(v[ut]).__webglTexture;
              i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0, i.TEXTURE_2D, Xt, 0);
            }
            i.blitFramebuffer(0, 0, F, q, 0, 0, F, q, K, i.NEAREST), l === true && (de.length = 0, U.length = 0, de.push(i.COLOR_ATTACHMENT0 + ut), T.depthBuffer && T.resolveDepthBuffer === false && (de.push(W), U.push(W), i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, U)), i.invalidateFramebuffer(i.READ_FRAMEBUFFER, de));
          }
          if (e.bindFramebuffer(i.READ_FRAMEBUFFER, null), e.bindFramebuffer(i.DRAW_FRAMEBUFFER, null), at) for (let ut = 0; ut < v.length; ut++) {
            e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglMultisampledFramebuffer), i.framebufferRenderbuffer(i.FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.RENDERBUFFER, xt.__webglColorRenderbuffer[ut]);
            const Xt = n.get(v[ut]).__webglTexture;
            e.bindFramebuffer(i.FRAMEBUFFER, xt.__webglFramebuffer), i.framebufferTexture2D(i.DRAW_FRAMEBUFFER, i.COLOR_ATTACHMENT0 + ut, i.TEXTURE_2D, Xt, 0);
          }
          e.bindFramebuffer(i.DRAW_FRAMEBUFFER, xt.__webglMultisampledFramebuffer);
        } else if (T.depthBuffer && T.resolveDepthBuffer === false && l) {
          const v = T.stencilBuffer ? i.DEPTH_STENCIL_ATTACHMENT : i.DEPTH_ATTACHMENT;
          i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER, [
            v
          ]);
        }
      }
    }
    function zt(T) {
      return Math.min(s.maxSamples, T.samples);
    }
    function Ht(T) {
      const v = n.get(T);
      return T.samples > 0 && t.has("WEBGL_multisampled_render_to_texture") === true && v.__useRenderToTexture !== false;
    }
    function bt(T) {
      const v = a.render.frame;
      h.get(T) !== v && (h.set(T, v), T.update());
    }
    function ie(T, v) {
      const F = T.colorSpace, q = T.format, K = T.type;
      return T.isCompressedTexture === true || T.isVideoTexture === true || F !== Bi && F !== In && (Vt.getTransfer(F) === $t ? (q !== $e || K !== Sn) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), v;
    }
    function yt(T) {
      return typeof HTMLImageElement < "u" && T instanceof HTMLImageElement ? (c.width = T.naturalWidth || T.width, c.height = T.naturalHeight || T.height) : typeof VideoFrame < "u" && T instanceof VideoFrame ? (c.width = T.displayWidth, c.height = T.displayHeight) : (c.width = T.width, c.height = T.height), c;
    }
    this.allocateTextureUnit = k, this.resetTextureUnits = G, this.setTexture2D = Z, this.setTexture2DArray = V, this.setTexture3D = Q, this.setTextureCube = H, this.rebindTextures = Ot, this.setupRenderTarget = oe, this.updateRenderTargetMipmap = Wt, this.updateMultisampleRenderTarget = ze, this.setupDepthRenderbuffer = Rt, this.setupFrameBufferTexture = vt, this.useMultisampledRTT = Ht;
  }
  function O_(i, t) {
    function e(n, s = In) {
      let r;
      const a = Vt.getTransfer(s);
      if (n === Sn) return i.UNSIGNED_BYTE;
      if (n === io) return i.UNSIGNED_SHORT_4_4_4_4;
      if (n === so) return i.UNSIGNED_SHORT_5_5_5_1;
      if (n === Wc) return i.UNSIGNED_INT_5_9_9_9_REV;
      if (n === Gc) return i.BYTE;
      if (n === Vc) return i.SHORT;
      if (n === ss) return i.UNSIGNED_SHORT;
      if (n === no) return i.INT;
      if (n === Jn) return i.UNSIGNED_INT;
      if (n === nn) return i.FLOAT;
      if (n === vn) return i.HALF_FLOAT;
      if (n === Xc) return i.ALPHA;
      if (n === Yc) return i.RGB;
      if (n === $e) return i.RGBA;
      if (n === qc) return i.LUMINANCE;
      if (n === jc) return i.LUMINANCE_ALPHA;
      if (n === Ai) return i.DEPTH_COMPONENT;
      if (n === Ii) return i.DEPTH_STENCIL;
      if (n === ro) return i.RED;
      if (n === ao) return i.RED_INTEGER;
      if (n === Kc) return i.RG;
      if (n === oo) return i.RG_INTEGER;
      if (n === lo) return i.RGBA_INTEGER;
      if (n === Vs || n === Ws || n === Xs || n === Ys) if (a === $t) if (r = t.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
        if (n === Vs) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
        if (n === Ws) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
        if (n === Xs) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
        if (n === Ys) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
      } else return null;
      else if (r = t.get("WEBGL_compressed_texture_s3tc"), r !== null) {
        if (n === Vs) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === Ws) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === Xs) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === Ys) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else return null;
      if (n === ma || n === ga || n === _a || n === va) if (r = t.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
        if (n === ma) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === ga) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === _a) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === va) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else return null;
      if (n === xa || n === Ma || n === Sa) if (r = t.get("WEBGL_compressed_texture_etc"), r !== null) {
        if (n === xa || n === Ma) return a === $t ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === Sa) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else return null;
      if (n === ya || n === Ea || n === ba || n === Ta || n === wa || n === Aa || n === Ca || n === Ra || n === Pa || n === Da || n === La || n === Ia || n === Ua || n === Na) if (r = t.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === ya) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === Ea) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === ba) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === Ta) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === wa) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === Aa) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === Ca) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === Ra) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === Pa) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === Da) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === La) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === Ia) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === Ua) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === Na) return a === $t ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else return null;
      if (n === qs || n === Fa || n === Oa) if (r = t.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === qs) return a === $t ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === Fa) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === Oa) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else return null;
      if (n === Zc || n === Ba || n === ka || n === za) if (r = t.get("EXT_texture_compression_rgtc"), r !== null) {
        if (n === qs) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === Ba) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === ka) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === za) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else return null;
      return n === Li ? i.UNSIGNED_INT_24_8 : i[n] !== void 0 ? i[n] : null;
    }
    return {
      convert: e
    };
  }
  class B_ extends Ie {
    constructor(t = []) {
      super(), this.isArrayCamera = true, this.cameras = t;
    }
  }
  class sn extends Se {
    constructor() {
      super(), this.isGroup = true, this.type = "Group";
    }
  }
  const k_ = {
    type: "move"
  };
  class Vr {
    constructor() {
      this._targetRay = null, this._grip = null, this._hand = null;
    }
    getHandSpace() {
      return this._hand === null && (this._hand = new sn(), this._hand.matrixAutoUpdate = false, this._hand.visible = false, this._hand.joints = {}, this._hand.inputState = {
        pinching: false
      }), this._hand;
    }
    getTargetRaySpace() {
      return this._targetRay === null && (this._targetRay = new sn(), this._targetRay.matrixAutoUpdate = false, this._targetRay.visible = false, this._targetRay.hasLinearVelocity = false, this._targetRay.linearVelocity = new C(), this._targetRay.hasAngularVelocity = false, this._targetRay.angularVelocity = new C()), this._targetRay;
    }
    getGripSpace() {
      return this._grip === null && (this._grip = new sn(), this._grip.matrixAutoUpdate = false, this._grip.visible = false, this._grip.hasLinearVelocity = false, this._grip.linearVelocity = new C(), this._grip.hasAngularVelocity = false, this._grip.angularVelocity = new C()), this._grip;
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
          for (const _ of t.hand.values()) {
            const m = e.getJointPose(_, n), u = this._getHandJoint(c, _);
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
        o !== null && (s = e.getPose(t.targetRaySpace, n), s === null && r !== null && (s = r), s !== null && (o.matrix.fromArray(s.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = true, s.linearVelocity ? (o.hasLinearVelocity = true, o.linearVelocity.copy(s.linearVelocity)) : o.hasLinearVelocity = false, s.angularVelocity ? (o.hasAngularVelocity = true, o.angularVelocity.copy(s.angularVelocity)) : o.hasAngularVelocity = false, this.dispatchEvent(k_)));
      }
      return o !== null && (o.visible = s !== null), l !== null && (l.visible = r !== null), c !== null && (c.visible = a !== null), this;
    }
    _getHandJoint(t, e) {
      if (t.joints[e.jointName] === void 0) {
        const n = new sn();
        n.matrixAutoUpdate = false, n.visible = false, t.joints[e.jointName] = n, t.add(n);
      }
      return t.joints[e.jointName];
    }
  }
  const z_ = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, H_ = `
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
  class G_ {
    constructor() {
      this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
    }
    init(t, e, n) {
      if (this.texture === null) {
        const s = new Re(), r = t.properties.get(s);
        r.__webglTexture = e.texture, (e.depthNear != n.depthNear || e.depthFar != n.depthFar) && (this.depthNear = e.depthNear, this.depthFar = e.depthFar), this.texture = s;
      }
    }
    getMesh(t) {
      if (this.texture !== null && this.mesh === null) {
        const e = t.cameras[0].viewport, n = new ae({
          vertexShader: z_,
          fragmentShader: H_,
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
        this.mesh = new he(new Mn(20, 20), n);
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
  class V_ extends ei {
    constructor(t, e) {
      super();
      const n = this;
      let s = null, r = 1, a = null, o = "local-floor", l = 1, c = null, h = null, d = null, f = null, p = null, g = null;
      const _ = new G_(), m = e.getContextAttributes();
      let u = null, E = null;
      const b = [], S = [], N = new _t();
      let w = null;
      const A = new Ie();
      A.viewport = new Qt();
      const P = new Ie();
      P.viewport = new Qt();
      const y = [
        A,
        P
      ], x = new B_();
      let R = null, G = null;
      this.cameraAutoUpdate = true, this.enabled = false, this.isPresenting = false, this.getController = function(Y) {
        let tt = b[Y];
        return tt === void 0 && (tt = new Vr(), b[Y] = tt), tt.getTargetRaySpace();
      }, this.getControllerGrip = function(Y) {
        let tt = b[Y];
        return tt === void 0 && (tt = new Vr(), b[Y] = tt), tt.getGripSpace();
      }, this.getHand = function(Y) {
        let tt = b[Y];
        return tt === void 0 && (tt = new Vr(), b[Y] = tt), tt.getHandSpace();
      };
      function k(Y) {
        const tt = S.indexOf(Y.inputSource);
        if (tt === -1) return;
        const vt = b[tt];
        vt !== void 0 && (vt.update(Y.inputSource, Y.frame, c || a), vt.dispatchEvent({
          type: Y.type,
          data: Y.inputSource
        }));
      }
      function X() {
        s.removeEventListener("select", k), s.removeEventListener("selectstart", k), s.removeEventListener("selectend", k), s.removeEventListener("squeeze", k), s.removeEventListener("squeezestart", k), s.removeEventListener("squeezeend", k), s.removeEventListener("end", X), s.removeEventListener("inputsourceschange", Z);
        for (let Y = 0; Y < b.length; Y++) {
          const tt = S[Y];
          tt !== null && (S[Y] = null, b[Y].disconnect(tt));
        }
        R = null, G = null, _.reset(), t.setRenderTarget(u), p = null, f = null, d = null, s = null, E = null, te.stop(), n.isPresenting = false, t.setPixelRatio(w), t.setSize(N.width, N.height, false), n.dispatchEvent({
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
          if (u = t.getRenderTarget(), s.addEventListener("select", k), s.addEventListener("selectstart", k), s.addEventListener("selectend", k), s.addEventListener("squeeze", k), s.addEventListener("squeezestart", k), s.addEventListener("squeezeend", k), s.addEventListener("end", X), s.addEventListener("inputsourceschange", Z), m.xrCompatible !== true && await e.makeXRCompatible(), w = t.getPixelRatio(), t.getSize(N), s.renderState.layers === void 0) {
            const tt = {
              antialias: m.antialias,
              alpha: true,
              depth: m.depth,
              stencil: m.stencil,
              framebufferScaleFactor: r
            };
            p = new XRWebGLLayer(s, e, tt), s.updateRenderState({
              baseLayer: p
            }), t.setPixelRatio(1), t.setSize(p.framebufferWidth, p.framebufferHeight, false), E = new Je(p.framebufferWidth, p.framebufferHeight, {
              format: $e,
              type: Sn,
              colorSpace: t.outputColorSpace,
              stencilBuffer: m.stencil
            });
          } else {
            let tt = null, vt = null, rt = null;
            m.depth && (rt = m.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, tt = m.stencil ? Ii : Ai, vt = m.stencil ? Li : Jn);
            const wt = {
              colorFormat: e.RGBA8,
              depthFormat: rt,
              scaleFactor: r
            };
            d = new XRWebGLBinding(s, e), f = d.createProjectionLayer(wt), s.updateRenderState({
              layers: [
                f
              ]
            }), t.setPixelRatio(1), t.setSize(f.textureWidth, f.textureHeight, false), E = new Je(f.textureWidth, f.textureHeight, {
              format: $e,
              type: Sn,
              depthTexture: new uh(f.textureWidth, f.textureHeight, vt, void 0, void 0, void 0, void 0, void 0, void 0, tt),
              stencilBuffer: m.stencil,
              colorSpace: t.outputColorSpace,
              samples: m.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === false
            });
          }
          E.isXRRenderTarget = true, this.setFoveation(l), c = null, a = await s.requestReferenceSpace(o), te.setContext(s), te.start(), n.isPresenting = true, n.dispatchEvent({
            type: "sessionstart"
          });
        }
      }, this.getEnvironmentBlendMode = function() {
        if (s !== null) return s.environmentBlendMode;
      }, this.getDepthTexture = function() {
        return _.getDepthTexture();
      };
      function Z(Y) {
        for (let tt = 0; tt < Y.removed.length; tt++) {
          const vt = Y.removed[tt], rt = S.indexOf(vt);
          rt >= 0 && (S[rt] = null, b[rt].disconnect(vt));
        }
        for (let tt = 0; tt < Y.added.length; tt++) {
          const vt = Y.added[tt];
          let rt = S.indexOf(vt);
          if (rt === -1) {
            for (let Rt = 0; Rt < b.length; Rt++) if (Rt >= S.length) {
              S.push(vt), rt = Rt;
              break;
            } else if (S[Rt] === null) {
              S[Rt] = vt, rt = Rt;
              break;
            }
            if (rt === -1) break;
          }
          const wt = b[rt];
          wt && wt.connect(vt);
        }
      }
      const V = new C(), Q = new C();
      function H(Y, tt, vt) {
        V.setFromMatrixPosition(tt.matrixWorld), Q.setFromMatrixPosition(vt.matrixWorld);
        const rt = V.distanceTo(Q), wt = tt.projectionMatrix.elements, Rt = vt.projectionMatrix.elements, Ot = wt[14] / (wt[10] - 1), oe = wt[14] / (wt[10] + 1), Wt = (wt[9] + 1) / wt[5], de = (wt[9] - 1) / wt[5], U = (wt[8] - 1) / wt[0], ze = (Rt[8] + 1) / Rt[0], zt = Ot * U, Ht = Ot * ze, bt = rt / (-U + ze), ie = bt * -U;
        if (tt.matrixWorld.decompose(Y.position, Y.quaternion, Y.scale), Y.translateX(ie), Y.translateZ(bt), Y.matrixWorld.compose(Y.position, Y.quaternion, Y.scale), Y.matrixWorldInverse.copy(Y.matrixWorld).invert(), wt[10] === -1) Y.projectionMatrix.copy(tt.projectionMatrix), Y.projectionMatrixInverse.copy(tt.projectionMatrixInverse);
        else {
          const yt = Ot + bt, T = oe + bt, v = zt - ie, F = Ht + (rt - ie), q = Wt * oe / T * yt, K = de * oe / T * yt;
          Y.projectionMatrix.makePerspective(v, F, q, K, yt, T), Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert();
        }
      }
      function st(Y, tt) {
        tt === null ? Y.matrixWorld.copy(Y.matrix) : Y.matrixWorld.multiplyMatrices(tt.matrixWorld, Y.matrix), Y.matrixWorldInverse.copy(Y.matrixWorld).invert();
      }
      this.updateCamera = function(Y) {
        if (s === null) return;
        let tt = Y.near, vt = Y.far;
        _.texture !== null && (_.depthNear > 0 && (tt = _.depthNear), _.depthFar > 0 && (vt = _.depthFar)), x.near = P.near = A.near = tt, x.far = P.far = A.far = vt, (R !== x.near || G !== x.far) && (s.updateRenderState({
          depthNear: x.near,
          depthFar: x.far
        }), R = x.near, G = x.far), A.layers.mask = Y.layers.mask | 2, P.layers.mask = Y.layers.mask | 4, x.layers.mask = A.layers.mask | P.layers.mask;
        const rt = Y.parent, wt = x.cameras;
        st(x, rt);
        for (let Rt = 0; Rt < wt.length; Rt++) st(wt[Rt], rt);
        wt.length === 2 ? H(x, A, P) : x.projectionMatrix.copy(A.projectionMatrix), ht(Y, x, rt);
      };
      function ht(Y, tt, vt) {
        vt === null ? Y.matrix.copy(tt.matrixWorld) : (Y.matrix.copy(vt.matrixWorld), Y.matrix.invert(), Y.matrix.multiply(tt.matrixWorld)), Y.matrix.decompose(Y.position, Y.quaternion, Y.scale), Y.updateMatrixWorld(true), Y.projectionMatrix.copy(tt.projectionMatrix), Y.projectionMatrixInverse.copy(tt.projectionMatrixInverse), Y.isPerspectiveCamera && (Y.fov = rs * 2 * Math.atan(1 / Y.projectionMatrix.elements[5]), Y.zoom = 1);
      }
      this.getCamera = function() {
        return x;
      }, this.getFoveation = function() {
        if (!(f === null && p === null)) return l;
      }, this.setFoveation = function(Y) {
        l = Y, f !== null && (f.fixedFoveation = Y), p !== null && p.fixedFoveation !== void 0 && (p.fixedFoveation = Y);
      }, this.hasDepthSensing = function() {
        return _.texture !== null;
      }, this.getDepthSensingMesh = function() {
        return _.getMesh(x);
      };
      let St = null;
      function Ft(Y, tt) {
        if (h = tt.getViewerPose(c || a), g = tt, h !== null) {
          const vt = h.views;
          p !== null && (t.setRenderTargetFramebuffer(E, p.framebuffer), t.setRenderTarget(E));
          let rt = false;
          vt.length !== x.cameras.length && (x.cameras.length = 0, rt = true);
          for (let Rt = 0; Rt < vt.length; Rt++) {
            const Ot = vt[Rt];
            let oe = null;
            if (p !== null) oe = p.getViewport(Ot);
            else {
              const de = d.getViewSubImage(f, Ot);
              oe = de.viewport, Rt === 0 && (t.setRenderTargetTextures(E, de.colorTexture, f.ignoreDepthValues ? void 0 : de.depthStencilTexture), t.setRenderTarget(E));
            }
            let Wt = y[Rt];
            Wt === void 0 && (Wt = new Ie(), Wt.layers.enable(Rt), Wt.viewport = new Qt(), y[Rt] = Wt), Wt.matrix.fromArray(Ot.transform.matrix), Wt.matrix.decompose(Wt.position, Wt.quaternion, Wt.scale), Wt.projectionMatrix.fromArray(Ot.projectionMatrix), Wt.projectionMatrixInverse.copy(Wt.projectionMatrix).invert(), Wt.viewport.set(oe.x, oe.y, oe.width, oe.height), Rt === 0 && (x.matrix.copy(Wt.matrix), x.matrix.decompose(x.position, x.quaternion, x.scale)), rt === true && x.cameras.push(Wt);
          }
          const wt = s.enabledFeatures;
          if (wt && wt.includes("depth-sensing")) {
            const Rt = d.getDepthInformation(vt[0]);
            Rt && Rt.isValid && Rt.texture && _.init(t, Rt, s.renderState);
          }
        }
        for (let vt = 0; vt < b.length; vt++) {
          const rt = S[vt], wt = b[vt];
          rt !== null && wt !== void 0 && wt.update(rt, tt, c || a);
        }
        St && St(Y, tt), tt.detectedPlanes && n.dispatchEvent({
          type: "planesdetected",
          data: tt
        }), g = null;
      }
      const te = new ch();
      te.setAnimationLoop(Ft), this.setAnimationLoop = function(Y) {
        St = Y;
      }, this.dispose = function() {
      };
    }
  }
  const Wn = new rn(), W_ = new qt();
  function X_(i, t) {
    function e(m, u) {
      m.matrixAutoUpdate === true && m.updateMatrix(), u.value.copy(m.matrix);
    }
    function n(m, u) {
      u.color.getRGB(m.fogColor.value, ah(i)), u.isFog ? (m.fogNear.value = u.near, m.fogFar.value = u.far) : u.isFogExp2 && (m.fogDensity.value = u.density);
    }
    function s(m, u, E, b, S) {
      u.isMeshBasicMaterial || u.isMeshLambertMaterial ? r(m, u) : u.isMeshToonMaterial ? (r(m, u), d(m, u)) : u.isMeshPhongMaterial ? (r(m, u), h(m, u)) : u.isMeshStandardMaterial ? (r(m, u), f(m, u), u.isMeshPhysicalMaterial && p(m, u, S)) : u.isMeshMatcapMaterial ? (r(m, u), g(m, u)) : u.isMeshDepthMaterial ? r(m, u) : u.isMeshDistanceMaterial ? (r(m, u), _(m, u)) : u.isMeshNormalMaterial ? r(m, u) : u.isLineBasicMaterial ? (a(m, u), u.isLineDashedMaterial && o(m, u)) : u.isPointsMaterial ? l(m, u, E, b) : u.isSpriteMaterial ? c(m, u) : u.isShadowMaterial ? (m.color.value.copy(u.color), m.opacity.value = u.opacity) : u.isShaderMaterial && (u.uniformsNeedUpdate = false);
    }
    function r(m, u) {
      m.opacity.value = u.opacity, u.color && m.diffuse.value.copy(u.color), u.emissive && m.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity), u.map && (m.map.value = u.map, e(u.map, m.mapTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.bumpMap && (m.bumpMap.value = u.bumpMap, e(u.bumpMap, m.bumpMapTransform), m.bumpScale.value = u.bumpScale, u.side === Ue && (m.bumpScale.value *= -1)), u.normalMap && (m.normalMap.value = u.normalMap, e(u.normalMap, m.normalMapTransform), m.normalScale.value.copy(u.normalScale), u.side === Ue && m.normalScale.value.negate()), u.displacementMap && (m.displacementMap.value = u.displacementMap, e(u.displacementMap, m.displacementMapTransform), m.displacementScale.value = u.displacementScale, m.displacementBias.value = u.displacementBias), u.emissiveMap && (m.emissiveMap.value = u.emissiveMap, e(u.emissiveMap, m.emissiveMapTransform)), u.specularMap && (m.specularMap.value = u.specularMap, e(u.specularMap, m.specularMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
      const E = t.get(u), b = E.envMap, S = E.envMapRotation;
      b && (m.envMap.value = b, Wn.copy(S), Wn.x *= -1, Wn.y *= -1, Wn.z *= -1, b.isCubeTexture && b.isRenderTargetTexture === false && (Wn.y *= -1, Wn.z *= -1), m.envMapRotation.value.setFromMatrix4(W_.makeRotationFromEuler(Wn)), m.flipEnvMap.value = b.isCubeTexture && b.isRenderTargetTexture === false ? -1 : 1, m.reflectivity.value = u.reflectivity, m.ior.value = u.ior, m.refractionRatio.value = u.refractionRatio), u.lightMap && (m.lightMap.value = u.lightMap, m.lightMapIntensity.value = u.lightMapIntensity, e(u.lightMap, m.lightMapTransform)), u.aoMap && (m.aoMap.value = u.aoMap, m.aoMapIntensity.value = u.aoMapIntensity, e(u.aoMap, m.aoMapTransform));
    }
    function a(m, u) {
      m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, u.map && (m.map.value = u.map, e(u.map, m.mapTransform));
    }
    function o(m, u) {
      m.dashSize.value = u.dashSize, m.totalSize.value = u.dashSize + u.gapSize, m.scale.value = u.scale;
    }
    function l(m, u, E, b) {
      m.diffuse.value.copy(u.color), m.opacity.value = u.opacity, m.size.value = u.size * E, m.scale.value = b * 0.5, u.map && (m.map.value = u.map, e(u.map, m.uvTransform)), u.alphaMap && (m.alphaMap.value = u.alphaMap, e(u.alphaMap, m.alphaMapTransform)), u.alphaTest > 0 && (m.alphaTest.value = u.alphaTest);
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
    function p(m, u, E) {
      m.ior.value = u.ior, u.sheen > 0 && (m.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen), m.sheenRoughness.value = u.sheenRoughness, u.sheenColorMap && (m.sheenColorMap.value = u.sheenColorMap, e(u.sheenColorMap, m.sheenColorMapTransform)), u.sheenRoughnessMap && (m.sheenRoughnessMap.value = u.sheenRoughnessMap, e(u.sheenRoughnessMap, m.sheenRoughnessMapTransform))), u.clearcoat > 0 && (m.clearcoat.value = u.clearcoat, m.clearcoatRoughness.value = u.clearcoatRoughness, u.clearcoatMap && (m.clearcoatMap.value = u.clearcoatMap, e(u.clearcoatMap, m.clearcoatMapTransform)), u.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = u.clearcoatRoughnessMap, e(u.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), u.clearcoatNormalMap && (m.clearcoatNormalMap.value = u.clearcoatNormalMap, e(u.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(u.clearcoatNormalScale), u.side === Ue && m.clearcoatNormalScale.value.negate())), u.dispersion > 0 && (m.dispersion.value = u.dispersion), u.iridescence > 0 && (m.iridescence.value = u.iridescence, m.iridescenceIOR.value = u.iridescenceIOR, m.iridescenceThicknessMinimum.value = u.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = u.iridescenceThicknessRange[1], u.iridescenceMap && (m.iridescenceMap.value = u.iridescenceMap, e(u.iridescenceMap, m.iridescenceMapTransform)), u.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = u.iridescenceThicknessMap, e(u.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), u.transmission > 0 && (m.transmission.value = u.transmission, m.transmissionSamplerMap.value = E.texture, m.transmissionSamplerSize.value.set(E.width, E.height), u.transmissionMap && (m.transmissionMap.value = u.transmissionMap, e(u.transmissionMap, m.transmissionMapTransform)), m.thickness.value = u.thickness, u.thicknessMap && (m.thicknessMap.value = u.thicknessMap, e(u.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = u.attenuationDistance, m.attenuationColor.value.copy(u.attenuationColor)), u.anisotropy > 0 && (m.anisotropyVector.value.set(u.anisotropy * Math.cos(u.anisotropyRotation), u.anisotropy * Math.sin(u.anisotropyRotation)), u.anisotropyMap && (m.anisotropyMap.value = u.anisotropyMap, e(u.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = u.specularIntensity, m.specularColor.value.copy(u.specularColor), u.specularColorMap && (m.specularColorMap.value = u.specularColorMap, e(u.specularColorMap, m.specularColorMapTransform)), u.specularIntensityMap && (m.specularIntensityMap.value = u.specularIntensityMap, e(u.specularIntensityMap, m.specularIntensityMapTransform));
    }
    function g(m, u) {
      u.matcap && (m.matcap.value = u.matcap);
    }
    function _(m, u) {
      const E = t.get(u).light;
      m.referencePosition.value.setFromMatrixPosition(E.matrixWorld), m.nearDistance.value = E.shadow.camera.near, m.farDistance.value = E.shadow.camera.far;
    }
    return {
      refreshFogUniforms: n,
      refreshMaterialUniforms: s
    };
  }
  function Y_(i, t, e, n) {
    let s = {}, r = {}, a = [];
    const o = i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);
    function l(E, b) {
      const S = b.program;
      n.uniformBlockBinding(E, S);
    }
    function c(E, b) {
      let S = s[E.id];
      S === void 0 && (g(E), S = h(E), s[E.id] = S, E.addEventListener("dispose", m));
      const N = b.program;
      n.updateUBOMapping(E, N);
      const w = t.render.frame;
      r[E.id] !== w && (f(E), r[E.id] = w);
    }
    function h(E) {
      const b = d();
      E.__bindingPointIndex = b;
      const S = i.createBuffer(), N = E.__size, w = E.usage;
      return i.bindBuffer(i.UNIFORM_BUFFER, S), i.bufferData(i.UNIFORM_BUFFER, N, w), i.bindBuffer(i.UNIFORM_BUFFER, null), i.bindBufferBase(i.UNIFORM_BUFFER, b, S), S;
    }
    function d() {
      for (let E = 0; E < o; E++) if (a.indexOf(E) === -1) return a.push(E), E;
      return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
    }
    function f(E) {
      const b = s[E.id], S = E.uniforms, N = E.__cache;
      i.bindBuffer(i.UNIFORM_BUFFER, b);
      for (let w = 0, A = S.length; w < A; w++) {
        const P = Array.isArray(S[w]) ? S[w] : [
          S[w]
        ];
        for (let y = 0, x = P.length; y < x; y++) {
          const R = P[y];
          if (p(R, w, y, N) === true) {
            const G = R.__offset, k = Array.isArray(R.value) ? R.value : [
              R.value
            ];
            let X = 0;
            for (let Z = 0; Z < k.length; Z++) {
              const V = k[Z], Q = _(V);
              typeof V == "number" || typeof V == "boolean" ? (R.__data[0] = V, i.bufferSubData(i.UNIFORM_BUFFER, G + X, R.__data)) : V.isMatrix3 ? (R.__data[0] = V.elements[0], R.__data[1] = V.elements[1], R.__data[2] = V.elements[2], R.__data[3] = 0, R.__data[4] = V.elements[3], R.__data[5] = V.elements[4], R.__data[6] = V.elements[5], R.__data[7] = 0, R.__data[8] = V.elements[6], R.__data[9] = V.elements[7], R.__data[10] = V.elements[8], R.__data[11] = 0) : (V.toArray(R.__data, X), X += Q.storage / Float32Array.BYTES_PER_ELEMENT);
            }
            i.bufferSubData(i.UNIFORM_BUFFER, G, R.__data);
          }
        }
      }
      i.bindBuffer(i.UNIFORM_BUFFER, null);
    }
    function p(E, b, S, N) {
      const w = E.value, A = b + "_" + S;
      if (N[A] === void 0) return typeof w == "number" || typeof w == "boolean" ? N[A] = w : N[A] = w.clone(), true;
      {
        const P = N[A];
        if (typeof w == "number" || typeof w == "boolean") {
          if (P !== w) return N[A] = w, true;
        } else if (P.equals(w) === false) return P.copy(w), true;
      }
      return false;
    }
    function g(E) {
      const b = E.uniforms;
      let S = 0;
      const N = 16;
      for (let A = 0, P = b.length; A < P; A++) {
        const y = Array.isArray(b[A]) ? b[A] : [
          b[A]
        ];
        for (let x = 0, R = y.length; x < R; x++) {
          const G = y[x], k = Array.isArray(G.value) ? G.value : [
            G.value
          ];
          for (let X = 0, Z = k.length; X < Z; X++) {
            const V = k[X], Q = _(V), H = S % N, st = H % Q.boundary, ht = H + st;
            S += st, ht !== 0 && N - ht < Q.storage && (S += N - ht), G.__data = new Float32Array(Q.storage / Float32Array.BYTES_PER_ELEMENT), G.__offset = S, S += Q.storage;
          }
        }
      }
      const w = S % N;
      return w > 0 && (S += N - w), E.__size = S, E.__cache = {}, this;
    }
    function _(E) {
      const b = {
        boundary: 0,
        storage: 0
      };
      return typeof E == "number" || typeof E == "boolean" ? (b.boundary = 4, b.storage = 4) : E.isVector2 ? (b.boundary = 8, b.storage = 8) : E.isVector3 || E.isColor ? (b.boundary = 16, b.storage = 12) : E.isVector4 ? (b.boundary = 16, b.storage = 16) : E.isMatrix3 ? (b.boundary = 48, b.storage = 48) : E.isMatrix4 ? (b.boundary = 64, b.storage = 64) : E.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", E), b;
    }
    function m(E) {
      const b = E.target;
      b.removeEventListener("dispose", m);
      const S = a.indexOf(b.__bindingPointIndex);
      a.splice(S, 1), i.deleteBuffer(s[b.id]), delete s[b.id], delete r[b.id];
    }
    function u() {
      for (const E in s) i.deleteBuffer(s[E]);
      a = [], s = {}, r = {};
    }
    return {
      bind: l,
      update: c,
      dispose: u
    };
  }
  class q_ {
    constructor(t = {}) {
      const { canvas: e = Nd(), context: n = null, depth: s = true, stencil: r = false, alpha: a = false, antialias: o = false, premultipliedAlpha: l = true, preserveDrawingBuffer: c = false, powerPreference: h = "default", failIfMajorPerformanceCaveat: d = false, reverseDepthBuffer: f = false } = t;
      this.isWebGLRenderer = true;
      let p;
      if (n !== null) {
        if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext) throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
        p = n.getContextAttributes().alpha;
      } else p = a;
      const g = new Uint32Array(4), _ = new Int32Array(4);
      let m = null, u = null;
      const E = [], b = [];
      this.domElement = e, this.debug = {
        checkShaderErrors: true,
        onShaderError: null
      }, this.autoClear = true, this.autoClearColor = true, this.autoClearDepth = true, this.autoClearStencil = true, this.sortObjects = true, this.clippingPlanes = [], this.localClippingEnabled = false, this._outputColorSpace = Be, this.toneMapping = Un, this.toneMappingExposure = 1;
      const S = this;
      let N = false, w = 0, A = 0, P = null, y = -1, x = null;
      const R = new Qt(), G = new Qt();
      let k = null;
      const X = new Et(0);
      let Z = 0, V = e.width, Q = e.height, H = 1, st = null, ht = null;
      const St = new Qt(0, 0, V, Q), Ft = new Qt(0, 0, V, Q);
      let te = false;
      const Y = new uo();
      let tt = false, vt = false;
      const rt = new qt(), wt = new qt(), Rt = new C(), Ot = new Qt(), oe = {
        background: null,
        fog: null,
        environment: null,
        overrideMaterial: null,
        isScene: true
      };
      let Wt = false;
      function de() {
        return P === null ? H : 1;
      }
      let U = n;
      function ze(M, L) {
        return e.getContext(M, L);
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
        if ("setAttribute" in e && e.setAttribute("data-engine", `three.js r${to}`), e.addEventListener("webglcontextlost", j, false), e.addEventListener("webglcontextrestored", ct, false), e.addEventListener("webglcontextcreationerror", ot, false), U === null) {
          const L = "webgl2";
          if (U = ze(L, M), U === null) throw ze(L) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
        }
      } catch (M) {
        throw console.error("THREE.WebGLRenderer: " + M.message), M;
      }
      let zt, Ht, bt, ie, yt, T, v, F, q, K, W, xt, at, ut, Xt, $, dt, Tt, At, ft, Gt, Ut, ee, D;
      function it() {
        zt = new Jm(U), zt.init(), Ut = new O_(U, zt), Ht = new Ym(U, zt, t, Ut), bt = new U_(U, zt), Ht.reverseDepthBuffer && f && bt.buffers.depth.setReversed(true), ie = new eg(U), yt = new x_(), T = new F_(U, zt, bt, yt, Ht, Ut, ie), v = new jm(S), F = new $m(S), q = new lf(U), ee = new Wm(U, q), K = new Qm(U, q, ie, ee), W = new ig(U, K, q, ie), At = new ng(U, Ht, T), $ = new qm(yt), xt = new v_(S, v, F, zt, Ht, ee, $), at = new X_(S, yt), ut = new S_(), Xt = new A_(zt), Tt = new Vm(S, v, F, bt, W, p, l), dt = new L_(S, W, Ht), D = new Y_(U, ie, Ht, bt), ft = new Xm(U, zt, ie), Gt = new tg(U, zt, ie), ie.programs = xt.programs, S.capabilities = Ht, S.extensions = zt, S.properties = yt, S.renderLists = ut, S.shadowMap = dt, S.state = bt, S.info = ie;
      }
      it();
      const z = new V_(S, U);
      this.xr = z, this.getContext = function() {
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
        return H;
      }, this.setPixelRatio = function(M) {
        M !== void 0 && (H = M, this.setSize(V, Q, false));
      }, this.getSize = function(M) {
        return M.set(V, Q);
      }, this.setSize = function(M, L, O = true) {
        if (z.isPresenting) {
          console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
          return;
        }
        V = M, Q = L, e.width = Math.floor(M * H), e.height = Math.floor(L * H), O === true && (e.style.width = M + "px", e.style.height = L + "px"), this.setViewport(0, 0, M, L);
      }, this.getDrawingBufferSize = function(M) {
        return M.set(V * H, Q * H).floor();
      }, this.setDrawingBufferSize = function(M, L, O) {
        V = M, Q = L, H = O, e.width = Math.floor(M * O), e.height = Math.floor(L * O), this.setViewport(0, 0, M, L);
      }, this.getCurrentViewport = function(M) {
        return M.copy(R);
      }, this.getViewport = function(M) {
        return M.copy(St);
      }, this.setViewport = function(M, L, O, B) {
        M.isVector4 ? St.set(M.x, M.y, M.z, M.w) : St.set(M, L, O, B), bt.viewport(R.copy(St).multiplyScalar(H).round());
      }, this.getScissor = function(M) {
        return M.copy(Ft);
      }, this.setScissor = function(M, L, O, B) {
        M.isVector4 ? Ft.set(M.x, M.y, M.z, M.w) : Ft.set(M, L, O, B), bt.scissor(G.copy(Ft).multiplyScalar(H).round());
      }, this.getScissorTest = function() {
        return te;
      }, this.setScissorTest = function(M) {
        bt.setScissorTest(te = M);
      }, this.setOpaqueSort = function(M) {
        st = M;
      }, this.setTransparentSort = function(M) {
        ht = M;
      }, this.getClearColor = function(M) {
        return M.copy(Tt.getClearColor());
      }, this.setClearColor = function() {
        Tt.setClearColor.apply(Tt, arguments);
      }, this.getClearAlpha = function() {
        return Tt.getClearAlpha();
      }, this.setClearAlpha = function() {
        Tt.setClearAlpha.apply(Tt, arguments);
      }, this.clear = function(M = true, L = true, O = true) {
        let B = 0;
        if (M) {
          let I = false;
          if (P !== null) {
            const J = P.texture.format;
            I = J === lo || J === oo || J === ao;
          }
          if (I) {
            const J = P.texture.type, lt = J === Sn || J === Jn || J === ss || J === Li || J === io || J === so, pt = Tt.getClearColor(), mt = Tt.getClearAlpha(), Ct = pt.r, Lt = pt.g, gt = pt.b;
            lt ? (g[0] = Ct, g[1] = Lt, g[2] = gt, g[3] = mt, U.clearBufferuiv(U.COLOR, 0, g)) : (_[0] = Ct, _[1] = Lt, _[2] = gt, _[3] = mt, U.clearBufferiv(U.COLOR, 0, _));
          } else B |= U.COLOR_BUFFER_BIT;
        }
        L && (B |= U.DEPTH_BUFFER_BIT), O && (B |= U.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), U.clear(B);
      }, this.clearColor = function() {
        this.clear(true, false, false);
      }, this.clearDepth = function() {
        this.clear(false, true, false);
      }, this.clearStencil = function() {
        this.clear(false, false, true);
      }, this.dispose = function() {
        e.removeEventListener("webglcontextlost", j, false), e.removeEventListener("webglcontextrestored", ct, false), e.removeEventListener("webglcontextcreationerror", ot, false), ut.dispose(), Xt.dispose(), yt.dispose(), v.dispose(), F.dispose(), W.dispose(), ee.dispose(), D.dispose(), xt.dispose(), z.dispose(), z.removeEventListener("sessionstart", Ao), z.removeEventListener("sessionend", Co), On.stop();
      };
      function j(M) {
        M.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), N = true;
      }
      function ct() {
        console.log("THREE.WebGLRenderer: Context Restored."), N = false;
        const M = ie.autoReset, L = dt.enabled, O = dt.autoUpdate, B = dt.needsUpdate, I = dt.type;
        it(), ie.autoReset = M, dt.enabled = L, dt.autoUpdate = O, dt.needsUpdate = B, dt.type = I;
      }
      function ot(M) {
        console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", M.statusMessage);
      }
      function Dt(M) {
        const L = M.target;
        L.removeEventListener("dispose", Dt), ce(L);
      }
      function ce(M) {
        ye(M), yt.remove(M);
      }
      function ye(M) {
        const L = yt.get(M).programs;
        L !== void 0 && (L.forEach(function(O) {
          xt.releaseProgram(O);
        }), M.isShaderMaterial && xt.releaseShaderCache(M));
      }
      this.renderBufferDirect = function(M, L, O, B, I, J) {
        L === null && (L = oe);
        const lt = I.isMesh && I.matrixWorld.determinant() < 0, pt = jh(M, L, O, B, I);
        bt.setMaterial(B, lt);
        let mt = O.index, Ct = 1;
        if (B.wireframe === true) {
          if (mt = K.getWireframeAttribute(O), mt === void 0) return;
          Ct = 2;
        }
        const Lt = O.drawRange, gt = O.attributes.position;
        let Yt = Lt.start * Ct, ne = (Lt.start + Lt.count) * Ct;
        J !== null && (Yt = Math.max(Yt, J.start * Ct), ne = Math.min(ne, (J.start + J.count) * Ct)), mt !== null ? (Yt = Math.max(Yt, 0), ne = Math.min(ne, mt.count)) : gt != null && (Yt = Math.max(Yt, 0), ne = Math.min(ne, gt.count));
        const se = ne - Yt;
        if (se < 0 || se === 1 / 0) return;
        ee.setup(I, B, pt, O, mt);
        let Pe, jt = ft;
        if (mt !== null && (Pe = q.get(mt), jt = Gt, jt.setIndex(Pe)), I.isMesh) B.wireframe === true ? (bt.setLineWidth(B.wireframeLinewidth * de()), jt.setMode(U.LINES)) : jt.setMode(U.TRIANGLES);
        else if (I.isLine) {
          let Mt = B.linewidth;
          Mt === void 0 && (Mt = 1), bt.setLineWidth(Mt * de()), I.isLineSegments ? jt.setMode(U.LINES) : I.isLineLoop ? jt.setMode(U.LINE_LOOP) : jt.setMode(U.LINE_STRIP);
        } else I.isPoints ? jt.setMode(U.POINTS) : I.isSprite && jt.setMode(U.TRIANGLES);
        if (I.isBatchedMesh) if (I._multiDrawInstances !== null) jt.renderMultiDrawInstances(I._multiDrawStarts, I._multiDrawCounts, I._multiDrawCount, I._multiDrawInstances);
        else if (zt.get("WEBGL_multi_draw")) jt.renderMultiDraw(I._multiDrawStarts, I._multiDrawCounts, I._multiDrawCount);
        else {
          const Mt = I._multiDrawStarts, on = I._multiDrawCounts, Kt = I._multiDrawCount, Xe = mt ? q.get(mt).bytesPerElement : 1, ri = yt.get(B).currentProgram.getUniforms();
          for (let Ne = 0; Ne < Kt; Ne++) ri.setValue(U, "_gl_DrawID", Ne), jt.render(Mt[Ne] / Xe, on[Ne]);
        }
        else if (I.isInstancedMesh) jt.renderInstances(Yt, se, I.count);
        else if (O.isInstancedBufferGeometry) {
          const Mt = O._maxInstanceCount !== void 0 ? O._maxInstanceCount : 1 / 0, on = Math.min(O.instanceCount, Mt);
          jt.renderInstances(Yt, se, on);
        } else jt.render(Yt, se);
      };
      function Zt(M, L, O) {
        M.transparent === true && M.side === Ce && M.forceSinglePass === false ? (M.side = Ue, M.needsUpdate = true, us(M, L, O), M.side = Fn, M.needsUpdate = true, us(M, L, O), M.side = Ce) : us(M, L, O);
      }
      this.compile = function(M, L, O = null) {
        O === null && (O = M), u = Xt.get(O), u.init(L), b.push(u), O.traverseVisible(function(I) {
          I.isLight && I.layers.test(L.layers) && (u.pushLight(I), I.castShadow && u.pushShadow(I));
        }), M !== O && M.traverseVisible(function(I) {
          I.isLight && I.layers.test(L.layers) && (u.pushLight(I), I.castShadow && u.pushShadow(I));
        }), u.setupLights();
        const B = /* @__PURE__ */ new Set();
        return M.traverse(function(I) {
          if (!(I.isMesh || I.isPoints || I.isLine || I.isSprite)) return;
          const J = I.material;
          if (J) if (Array.isArray(J)) for (let lt = 0; lt < J.length; lt++) {
            const pt = J[lt];
            Zt(pt, O, I), B.add(pt);
          }
          else Zt(J, O, I), B.add(J);
        }), b.pop(), u = null, B;
      }, this.compileAsync = function(M, L, O = null) {
        const B = this.compile(M, L, O);
        return new Promise((I) => {
          function J() {
            if (B.forEach(function(lt) {
              yt.get(lt).currentProgram.isReady() && B.delete(lt);
            }), B.size === 0) {
              I(M);
              return;
            }
            setTimeout(J, 10);
          }
          zt.get("KHR_parallel_shader_compile") !== null ? J() : setTimeout(J, 10);
        });
      };
      let We = null;
      function an(M) {
        We && We(M);
      }
      function Ao() {
        On.stop();
      }
      function Co() {
        On.start();
      }
      const On = new ch();
      On.setAnimationLoop(an), typeof self < "u" && On.setContext(self), this.setAnimationLoop = function(M) {
        We = M, z.setAnimationLoop(M), M === null ? On.stop() : On.start();
      }, z.addEventListener("sessionstart", Ao), z.addEventListener("sessionend", Co), this.render = function(M, L) {
        if (L !== void 0 && L.isCamera !== true) {
          console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
          return;
        }
        if (N === true) return;
        if (M.matrixWorldAutoUpdate === true && M.updateMatrixWorld(), L.parent === null && L.matrixWorldAutoUpdate === true && L.updateMatrixWorld(), z.enabled === true && z.isPresenting === true && (z.cameraAutoUpdate === true && z.updateCamera(L), L = z.getCamera()), M.isScene === true && M.onBeforeRender(S, M, L, P), u = Xt.get(M, b.length), u.init(L), b.push(u), wt.multiplyMatrices(L.projectionMatrix, L.matrixWorldInverse), Y.setFromProjectionMatrix(wt), vt = this.localClippingEnabled, tt = $.init(this.clippingPlanes, vt), m = ut.get(M, E.length), m.init(), E.push(m), z.enabled === true && z.isPresenting === true) {
          const J = S.xr.getDepthSensingMesh();
          J !== null && fr(J, L, -1 / 0, S.sortObjects);
        }
        fr(M, L, 0, S.sortObjects), m.finish(), S.sortObjects === true && m.sort(st, ht), Wt = z.enabled === false || z.isPresenting === false || z.hasDepthSensing() === false, Wt && Tt.addToRenderList(m, M), this.info.render.frame++, tt === true && $.beginShadows();
        const O = u.state.shadowsArray;
        dt.render(O, M, L), tt === true && $.endShadows(), this.info.autoReset === true && this.info.reset();
        const B = m.opaque, I = m.transmissive;
        if (u.setupLights(), L.isArrayCamera) {
          const J = L.cameras;
          if (I.length > 0) for (let lt = 0, pt = J.length; lt < pt; lt++) {
            const mt = J[lt];
            Po(B, I, M, mt);
          }
          Wt && Tt.render(M);
          for (let lt = 0, pt = J.length; lt < pt; lt++) {
            const mt = J[lt];
            Ro(m, M, mt, mt.viewport);
          }
        } else I.length > 0 && Po(B, I, M, L), Wt && Tt.render(M), Ro(m, M, L);
        P !== null && (T.updateMultisampleRenderTarget(P), T.updateRenderTargetMipmap(P)), M.isScene === true && M.onAfterRender(S, M, L), ee.resetDefaultState(), y = -1, x = null, b.pop(), b.length > 0 ? (u = b[b.length - 1], tt === true && $.setGlobalState(S.clippingPlanes, u.state.camera)) : u = null, E.pop(), E.length > 0 ? m = E[E.length - 1] : m = null;
      };
      function fr(M, L, O, B) {
        if (M.visible === false) return;
        if (M.layers.test(L.layers)) {
          if (M.isGroup) O = M.renderOrder;
          else if (M.isLOD) M.autoUpdate === true && M.update(L);
          else if (M.isLight) u.pushLight(M), M.castShadow && u.pushShadow(M);
          else if (M.isSprite) {
            if (!M.frustumCulled || Y.intersectsSprite(M)) {
              B && Ot.setFromMatrixPosition(M.matrixWorld).applyMatrix4(wt);
              const lt = W.update(M), pt = M.material;
              pt.visible && m.push(M, lt, pt, O, Ot.z, null);
            }
          } else if ((M.isMesh || M.isLine || M.isPoints) && (!M.frustumCulled || Y.intersectsObject(M))) {
            const lt = W.update(M), pt = M.material;
            if (B && (M.boundingSphere !== void 0 ? (M.boundingSphere === null && M.computeBoundingSphere(), Ot.copy(M.boundingSphere.center)) : (lt.boundingSphere === null && lt.computeBoundingSphere(), Ot.copy(lt.boundingSphere.center)), Ot.applyMatrix4(M.matrixWorld).applyMatrix4(wt)), Array.isArray(pt)) {
              const mt = lt.groups;
              for (let Ct = 0, Lt = mt.length; Ct < Lt; Ct++) {
                const gt = mt[Ct], Yt = pt[gt.materialIndex];
                Yt && Yt.visible && m.push(M, lt, Yt, O, Ot.z, gt);
              }
            } else pt.visible && m.push(M, lt, pt, O, Ot.z, null);
          }
        }
        const J = M.children;
        for (let lt = 0, pt = J.length; lt < pt; lt++) fr(J[lt], L, O, B);
      }
      function Ro(M, L, O, B) {
        const I = M.opaque, J = M.transmissive, lt = M.transparent;
        u.setupLightsView(O), tt === true && $.setGlobalState(S.clippingPlanes, O), B && bt.viewport(R.copy(B)), I.length > 0 && hs(I, L, O), J.length > 0 && hs(J, L, O), lt.length > 0 && hs(lt, L, O), bt.buffers.depth.setTest(true), bt.buffers.depth.setMask(true), bt.buffers.color.setMask(true), bt.setPolygonOffset(false);
      }
      function Po(M, L, O, B) {
        if ((O.isScene === true ? O.overrideMaterial : null) !== null) return;
        u.state.transmissionRenderTarget[B.id] === void 0 && (u.state.transmissionRenderTarget[B.id] = new Je(1, 1, {
          generateMipmaps: true,
          type: zt.has("EXT_color_buffer_half_float") || zt.has("EXT_color_buffer_float") ? vn : Sn,
          minFilter: Zn,
          samples: 4,
          stencilBuffer: r,
          resolveDepthBuffer: false,
          resolveStencilBuffer: false,
          colorSpace: Vt.workingColorSpace
        }));
        const J = u.state.transmissionRenderTarget[B.id], lt = B.viewport || R;
        J.setSize(lt.z, lt.w);
        const pt = S.getRenderTarget();
        S.setRenderTarget(J), S.getClearColor(X), Z = S.getClearAlpha(), Z < 1 && S.setClearColor(16777215, 0.5), S.clear(), Wt && Tt.render(O);
        const mt = S.toneMapping;
        S.toneMapping = Un;
        const Ct = B.viewport;
        if (B.viewport !== void 0 && (B.viewport = void 0), u.setupLightsView(B), tt === true && $.setGlobalState(S.clippingPlanes, B), hs(M, O, B), T.updateMultisampleRenderTarget(J), T.updateRenderTargetMipmap(J), zt.has("WEBGL_multisampled_render_to_texture") === false) {
          let Lt = false;
          for (let gt = 0, Yt = L.length; gt < Yt; gt++) {
            const ne = L[gt], se = ne.object, Pe = ne.geometry, jt = ne.material, Mt = ne.group;
            if (jt.side === Ce && se.layers.test(B.layers)) {
              const on = jt.side;
              jt.side = Ue, jt.needsUpdate = true, Do(se, O, B, Pe, jt, Mt), jt.side = on, jt.needsUpdate = true, Lt = true;
            }
          }
          Lt === true && (T.updateMultisampleRenderTarget(J), T.updateRenderTargetMipmap(J));
        }
        S.setRenderTarget(pt), S.setClearColor(X, Z), Ct !== void 0 && (B.viewport = Ct), S.toneMapping = mt;
      }
      function hs(M, L, O) {
        const B = L.isScene === true ? L.overrideMaterial : null;
        for (let I = 0, J = M.length; I < J; I++) {
          const lt = M[I], pt = lt.object, mt = lt.geometry, Ct = B === null ? lt.material : B, Lt = lt.group;
          pt.layers.test(O.layers) && Do(pt, L, O, mt, Ct, Lt);
        }
      }
      function Do(M, L, O, B, I, J) {
        M.onBeforeRender(S, L, O, B, I, J), M.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse, M.matrixWorld), M.normalMatrix.getNormalMatrix(M.modelViewMatrix), I.onBeforeRender(S, L, O, B, M, J), I.transparent === true && I.side === Ce && I.forceSinglePass === false ? (I.side = Ue, I.needsUpdate = true, S.renderBufferDirect(O, L, B, I, M, J), I.side = Fn, I.needsUpdate = true, S.renderBufferDirect(O, L, B, I, M, J), I.side = Ce) : S.renderBufferDirect(O, L, B, I, M, J), M.onAfterRender(S, L, O, B, I, J);
      }
      function us(M, L, O) {
        L.isScene !== true && (L = oe);
        const B = yt.get(M), I = u.state.lights, J = u.state.shadowsArray, lt = I.state.version, pt = xt.getParameters(M, I.state, J, L, O), mt = xt.getProgramCacheKey(pt);
        let Ct = B.programs;
        B.environment = M.isMeshStandardMaterial ? L.environment : null, B.fog = L.fog, B.envMap = (M.isMeshStandardMaterial ? F : v).get(M.envMap || B.environment), B.envMapRotation = B.environment !== null && M.envMap === null ? L.environmentRotation : M.envMapRotation, Ct === void 0 && (M.addEventListener("dispose", Dt), Ct = /* @__PURE__ */ new Map(), B.programs = Ct);
        let Lt = Ct.get(mt);
        if (Lt !== void 0) {
          if (B.currentProgram === Lt && B.lightsStateVersion === lt) return Io(M, pt), Lt;
        } else pt.uniforms = xt.getUniforms(M), M.onBeforeCompile(pt, S), Lt = xt.acquireProgram(pt, mt), Ct.set(mt, Lt), B.uniforms = pt.uniforms;
        const gt = B.uniforms;
        return (!M.isShaderMaterial && !M.isRawShaderMaterial || M.clipping === true) && (gt.clippingPlanes = $.uniform), Io(M, pt), B.needsLights = Zh(M), B.lightsStateVersion = lt, B.needsLights && (gt.ambientLightColor.value = I.state.ambient, gt.lightProbe.value = I.state.probe, gt.directionalLights.value = I.state.directional, gt.directionalLightShadows.value = I.state.directionalShadow, gt.spotLights.value = I.state.spot, gt.spotLightShadows.value = I.state.spotShadow, gt.rectAreaLights.value = I.state.rectArea, gt.ltc_1.value = I.state.rectAreaLTC1, gt.ltc_2.value = I.state.rectAreaLTC2, gt.pointLights.value = I.state.point, gt.pointLightShadows.value = I.state.pointShadow, gt.hemisphereLights.value = I.state.hemi, gt.directionalShadowMap.value = I.state.directionalShadowMap, gt.directionalShadowMatrix.value = I.state.directionalShadowMatrix, gt.spotShadowMap.value = I.state.spotShadowMap, gt.spotLightMatrix.value = I.state.spotLightMatrix, gt.spotLightMap.value = I.state.spotLightMap, gt.pointShadowMap.value = I.state.pointShadowMap, gt.pointShadowMatrix.value = I.state.pointShadowMatrix), B.currentProgram = Lt, B.uniformsList = null, Lt;
      }
      function Lo(M) {
        if (M.uniformsList === null) {
          const L = M.currentProgram.getUniforms();
          M.uniformsList = js.seqWithValue(L.seq, M.uniforms);
        }
        return M.uniformsList;
      }
      function Io(M, L) {
        const O = yt.get(M);
        O.outputColorSpace = L.outputColorSpace, O.batching = L.batching, O.batchingColor = L.batchingColor, O.instancing = L.instancing, O.instancingColor = L.instancingColor, O.instancingMorph = L.instancingMorph, O.skinning = L.skinning, O.morphTargets = L.morphTargets, O.morphNormals = L.morphNormals, O.morphColors = L.morphColors, O.morphTargetsCount = L.morphTargetsCount, O.numClippingPlanes = L.numClippingPlanes, O.numIntersection = L.numClipIntersection, O.vertexAlphas = L.vertexAlphas, O.vertexTangents = L.vertexTangents, O.toneMapping = L.toneMapping;
      }
      function jh(M, L, O, B, I) {
        L.isScene !== true && (L = oe), T.resetTextureUnits();
        const J = L.fog, lt = B.isMeshStandardMaterial ? L.environment : null, pt = P === null ? S.outputColorSpace : P.isXRRenderTarget === true ? P.texture.colorSpace : Bi, mt = (B.isMeshStandardMaterial ? F : v).get(B.envMap || lt), Ct = B.vertexColors === true && !!O.attributes.color && O.attributes.color.itemSize === 4, Lt = !!O.attributes.tangent && (!!B.normalMap || B.anisotropy > 0), gt = !!O.morphAttributes.position, Yt = !!O.morphAttributes.normal, ne = !!O.morphAttributes.color;
        let se = Un;
        B.toneMapped && (P === null || P.isXRRenderTarget === true) && (se = S.toneMapping);
        const Pe = O.morphAttributes.position || O.morphAttributes.normal || O.morphAttributes.color, jt = Pe !== void 0 ? Pe.length : 0, Mt = yt.get(B), on = u.state.lights;
        if (tt === true && (vt === true || M !== x)) {
          const He = M === x && B.id === y;
          $.setState(B, M, He);
        }
        let Kt = false;
        B.version === Mt.__version ? (Mt.needsLights && Mt.lightsStateVersion !== on.state.version || Mt.outputColorSpace !== pt || I.isBatchedMesh && Mt.batching === false || !I.isBatchedMesh && Mt.batching === true || I.isBatchedMesh && Mt.batchingColor === true && I.colorTexture === null || I.isBatchedMesh && Mt.batchingColor === false && I.colorTexture !== null || I.isInstancedMesh && Mt.instancing === false || !I.isInstancedMesh && Mt.instancing === true || I.isSkinnedMesh && Mt.skinning === false || !I.isSkinnedMesh && Mt.skinning === true || I.isInstancedMesh && Mt.instancingColor === true && I.instanceColor === null || I.isInstancedMesh && Mt.instancingColor === false && I.instanceColor !== null || I.isInstancedMesh && Mt.instancingMorph === true && I.morphTexture === null || I.isInstancedMesh && Mt.instancingMorph === false && I.morphTexture !== null || Mt.envMap !== mt || B.fog === true && Mt.fog !== J || Mt.numClippingPlanes !== void 0 && (Mt.numClippingPlanes !== $.numPlanes || Mt.numIntersection !== $.numIntersection) || Mt.vertexAlphas !== Ct || Mt.vertexTangents !== Lt || Mt.morphTargets !== gt || Mt.morphNormals !== Yt || Mt.morphColors !== ne || Mt.toneMapping !== se || Mt.morphTargetsCount !== jt) && (Kt = true) : (Kt = true, Mt.__version = B.version);
        let Xe = Mt.currentProgram;
        Kt === true && (Xe = us(B, L, I));
        let ri = false, Ne = false, Gi = false;
        const re = Xe.getUniforms(), Qe = Mt.uniforms;
        if (bt.useProgram(Xe.program) && (ri = true, Ne = true, Gi = true), B.id !== y && (y = B.id, Ne = true), ri || x !== M) {
          bt.buffers.depth.getReversed() ? (rt.copy(M.projectionMatrix), Od(rt), Bd(rt), re.setValue(U, "projectionMatrix", rt)) : re.setValue(U, "projectionMatrix", M.projectionMatrix), re.setValue(U, "viewMatrix", M.matrixWorldInverse);
          const yn = re.map.cameraPosition;
          yn !== void 0 && yn.setValue(U, Rt.setFromMatrixPosition(M.matrixWorld)), Ht.logarithmicDepthBuffer && re.setValue(U, "logDepthBufFC", 2 / (Math.log(M.far + 1) / Math.LN2)), (B.isMeshPhongMaterial || B.isMeshToonMaterial || B.isMeshLambertMaterial || B.isMeshBasicMaterial || B.isMeshStandardMaterial || B.isShaderMaterial) && re.setValue(U, "isOrthographic", M.isOrthographicCamera === true), x !== M && (x = M, Ne = true, Gi = true);
        }
        if (I.isSkinnedMesh) {
          re.setOptional(U, I, "bindMatrix"), re.setOptional(U, I, "bindMatrixInverse");
          const He = I.skeleton;
          He && (He.boneTexture === null && He.computeBoneTexture(), re.setValue(U, "boneTexture", He.boneTexture, T));
        }
        I.isBatchedMesh && (re.setOptional(U, I, "batchingTexture"), re.setValue(U, "batchingTexture", I._matricesTexture, T), re.setOptional(U, I, "batchingIdTexture"), re.setValue(U, "batchingIdTexture", I._indirectTexture, T), re.setOptional(U, I, "batchingColorTexture"), I._colorsTexture !== null && re.setValue(U, "batchingColorTexture", I._colorsTexture, T));
        const Vi = O.morphAttributes;
        if ((Vi.position !== void 0 || Vi.normal !== void 0 || Vi.color !== void 0) && At.update(I, O, Xe), (Ne || Mt.receiveShadow !== I.receiveShadow) && (Mt.receiveShadow = I.receiveShadow, re.setValue(U, "receiveShadow", I.receiveShadow)), B.isMeshGouraudMaterial && B.envMap !== null && (Qe.envMap.value = mt, Qe.flipEnvMap.value = mt.isCubeTexture && mt.isRenderTargetTexture === false ? -1 : 1), B.isMeshStandardMaterial && B.envMap === null && L.environment !== null && (Qe.envMapIntensity.value = L.environmentIntensity), Ne && (re.setValue(U, "toneMappingExposure", S.toneMappingExposure), Mt.needsLights && Kh(Qe, Gi), J && B.fog === true && at.refreshFogUniforms(Qe, J), at.refreshMaterialUniforms(Qe, B, H, Q, u.state.transmissionRenderTarget[M.id]), js.upload(U, Lo(Mt), Qe, T)), B.isShaderMaterial && B.uniformsNeedUpdate === true && (js.upload(U, Lo(Mt), Qe, T), B.uniformsNeedUpdate = false), B.isSpriteMaterial && re.setValue(U, "center", I.center), re.setValue(U, "modelViewMatrix", I.modelViewMatrix), re.setValue(U, "normalMatrix", I.normalMatrix), re.setValue(U, "modelMatrix", I.matrixWorld), B.isShaderMaterial || B.isRawShaderMaterial) {
          const He = B.uniformsGroups;
          for (let yn = 0, En = He.length; yn < En; yn++) {
            const Uo = He[yn];
            D.update(Uo, Xe), D.bind(Uo, Xe);
          }
        }
        return Xe;
      }
      function Kh(M, L) {
        M.ambientLightColor.needsUpdate = L, M.lightProbe.needsUpdate = L, M.directionalLights.needsUpdate = L, M.directionalLightShadows.needsUpdate = L, M.pointLights.needsUpdate = L, M.pointLightShadows.needsUpdate = L, M.spotLights.needsUpdate = L, M.spotLightShadows.needsUpdate = L, M.rectAreaLights.needsUpdate = L, M.hemisphereLights.needsUpdate = L;
      }
      function Zh(M) {
        return M.isMeshLambertMaterial || M.isMeshToonMaterial || M.isMeshPhongMaterial || M.isMeshStandardMaterial || M.isShadowMaterial || M.isShaderMaterial && M.lights === true;
      }
      this.getActiveCubeFace = function() {
        return w;
      }, this.getActiveMipmapLevel = function() {
        return A;
      }, this.getRenderTarget = function() {
        return P;
      }, this.setRenderTargetTextures = function(M, L, O) {
        yt.get(M.texture).__webglTexture = L, yt.get(M.depthTexture).__webglTexture = O;
        const B = yt.get(M);
        B.__hasExternalTextures = true, B.__autoAllocateDepthBuffer = O === void 0, B.__autoAllocateDepthBuffer || zt.has("WEBGL_multisampled_render_to_texture") === true && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), B.__useRenderToTexture = false);
      }, this.setRenderTargetFramebuffer = function(M, L) {
        const O = yt.get(M);
        O.__webglFramebuffer = L, O.__useDefaultFramebuffer = L === void 0;
      }, this.setRenderTarget = function(M, L = 0, O = 0) {
        P = M, w = L, A = O;
        let B = true, I = null, J = false, lt = false;
        if (M) {
          const mt = yt.get(M);
          if (mt.__useDefaultFramebuffer !== void 0) bt.bindFramebuffer(U.FRAMEBUFFER, null), B = false;
          else if (mt.__webglFramebuffer === void 0) T.setupRenderTarget(M);
          else if (mt.__hasExternalTextures) T.rebindTextures(M, yt.get(M.texture).__webglTexture, yt.get(M.depthTexture).__webglTexture);
          else if (M.depthBuffer) {
            const gt = M.depthTexture;
            if (mt.__boundDepthTexture !== gt) {
              if (gt !== null && yt.has(gt) && (M.width !== gt.image.width || M.height !== gt.image.height)) throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
              T.setupDepthRenderbuffer(M);
            }
          }
          const Ct = M.texture;
          (Ct.isData3DTexture || Ct.isDataArrayTexture || Ct.isCompressedArrayTexture) && (lt = true);
          const Lt = yt.get(M).__webglFramebuffer;
          M.isWebGLCubeRenderTarget ? (Array.isArray(Lt[L]) ? I = Lt[L][O] : I = Lt[L], J = true) : M.samples > 0 && T.useMultisampledRTT(M) === false ? I = yt.get(M).__webglMultisampledFramebuffer : Array.isArray(Lt) ? I = Lt[O] : I = Lt, R.copy(M.viewport), G.copy(M.scissor), k = M.scissorTest;
        } else R.copy(St).multiplyScalar(H).floor(), G.copy(Ft).multiplyScalar(H).floor(), k = te;
        if (bt.bindFramebuffer(U.FRAMEBUFFER, I) && B && bt.drawBuffers(M, I), bt.viewport(R), bt.scissor(G), bt.setScissorTest(k), J) {
          const mt = yt.get(M.texture);
          U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + L, mt.__webglTexture, O);
        } else if (lt) {
          const mt = yt.get(M.texture), Ct = L || 0;
          U.framebufferTextureLayer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, mt.__webglTexture, O || 0, Ct);
        }
        y = -1;
      }, this.readRenderTargetPixels = function(M, L, O, B, I, J, lt) {
        if (!(M && M.isWebGLRenderTarget)) {
          console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
          return;
        }
        let pt = yt.get(M).__webglFramebuffer;
        if (M.isWebGLCubeRenderTarget && lt !== void 0 && (pt = pt[lt]), pt) {
          bt.bindFramebuffer(U.FRAMEBUFFER, pt);
          try {
            const mt = M.texture, Ct = mt.format, Lt = mt.type;
            if (!Ht.textureFormatReadable(Ct)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
              return;
            }
            if (!Ht.textureTypeReadable(Lt)) {
              console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
              return;
            }
            L >= 0 && L <= M.width - B && O >= 0 && O <= M.height - I && U.readPixels(L, O, B, I, Ut.convert(Ct), Ut.convert(Lt), J);
          } finally {
            const mt = P !== null ? yt.get(P).__webglFramebuffer : null;
            bt.bindFramebuffer(U.FRAMEBUFFER, mt);
          }
        }
      }, this.readRenderTargetPixelsAsync = async function(M, L, O, B, I, J, lt) {
        if (!(M && M.isWebGLRenderTarget)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        let pt = yt.get(M).__webglFramebuffer;
        if (M.isWebGLCubeRenderTarget && lt !== void 0 && (pt = pt[lt]), pt) {
          const mt = M.texture, Ct = mt.format, Lt = mt.type;
          if (!Ht.textureFormatReadable(Ct)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!Ht.textureTypeReadable(Lt)) throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          if (L >= 0 && L <= M.width - B && O >= 0 && O <= M.height - I) {
            bt.bindFramebuffer(U.FRAMEBUFFER, pt);
            const gt = U.createBuffer();
            U.bindBuffer(U.PIXEL_PACK_BUFFER, gt), U.bufferData(U.PIXEL_PACK_BUFFER, J.byteLength, U.STREAM_READ), U.readPixels(L, O, B, I, Ut.convert(Ct), Ut.convert(Lt), 0);
            const Yt = P !== null ? yt.get(P).__webglFramebuffer : null;
            bt.bindFramebuffer(U.FRAMEBUFFER, Yt);
            const ne = U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE, 0);
            return U.flush(), await Fd(U, ne, 4), U.bindBuffer(U.PIXEL_PACK_BUFFER, gt), U.getBufferSubData(U.PIXEL_PACK_BUFFER, 0, J), U.deleteBuffer(gt), U.deleteSync(ne), J;
          } else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
        }
      }, this.copyFramebufferToTexture = function(M, L = null, O = 0) {
        M.isTexture !== true && (ts("WebGLRenderer: copyFramebufferToTexture function signature has changed."), L = arguments[0] || null, M = arguments[1]);
        const B = Math.pow(2, -O), I = Math.floor(M.image.width * B), J = Math.floor(M.image.height * B), lt = L !== null ? L.x : 0, pt = L !== null ? L.y : 0;
        T.setTexture2D(M, 0), U.copyTexSubImage2D(U.TEXTURE_2D, O, 0, 0, lt, pt, I, J), bt.unbindTexture();
      }, this.copyTextureToTexture = function(M, L, O = null, B = null, I = 0) {
        M.isTexture !== true && (ts("WebGLRenderer: copyTextureToTexture function signature has changed."), B = arguments[0] || null, M = arguments[1], L = arguments[2], I = arguments[3] || 0, O = null);
        let J, lt, pt, mt, Ct, Lt, gt, Yt, ne;
        const se = M.isCompressedTexture ? M.mipmaps[I] : M.image;
        O !== null ? (J = O.max.x - O.min.x, lt = O.max.y - O.min.y, pt = O.isBox3 ? O.max.z - O.min.z : 1, mt = O.min.x, Ct = O.min.y, Lt = O.isBox3 ? O.min.z : 0) : (J = se.width, lt = se.height, pt = se.depth || 1, mt = 0, Ct = 0, Lt = 0), B !== null ? (gt = B.x, Yt = B.y, ne = B.z) : (gt = 0, Yt = 0, ne = 0);
        const Pe = Ut.convert(L.format), jt = Ut.convert(L.type);
        let Mt;
        L.isData3DTexture ? (T.setTexture3D(L, 0), Mt = U.TEXTURE_3D) : L.isDataArrayTexture || L.isCompressedArrayTexture ? (T.setTexture2DArray(L, 0), Mt = U.TEXTURE_2D_ARRAY) : (T.setTexture2D(L, 0), Mt = U.TEXTURE_2D), U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, L.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, L.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, L.unpackAlignment);
        const on = U.getParameter(U.UNPACK_ROW_LENGTH), Kt = U.getParameter(U.UNPACK_IMAGE_HEIGHT), Xe = U.getParameter(U.UNPACK_SKIP_PIXELS), ri = U.getParameter(U.UNPACK_SKIP_ROWS), Ne = U.getParameter(U.UNPACK_SKIP_IMAGES);
        U.pixelStorei(U.UNPACK_ROW_LENGTH, se.width), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, se.height), U.pixelStorei(U.UNPACK_SKIP_PIXELS, mt), U.pixelStorei(U.UNPACK_SKIP_ROWS, Ct), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Lt);
        const Gi = M.isDataArrayTexture || M.isData3DTexture, re = L.isDataArrayTexture || L.isData3DTexture;
        if (M.isRenderTargetTexture || M.isDepthTexture) {
          const Qe = yt.get(M), Vi = yt.get(L), He = yt.get(Qe.__renderTarget), yn = yt.get(Vi.__renderTarget);
          bt.bindFramebuffer(U.READ_FRAMEBUFFER, He.__webglFramebuffer), bt.bindFramebuffer(U.DRAW_FRAMEBUFFER, yn.__webglFramebuffer);
          for (let En = 0; En < pt; En++) Gi && U.framebufferTextureLayer(U.READ_FRAMEBUFFER, U.COLOR_ATTACHMENT0, yt.get(M).__webglTexture, I, Lt + En), M.isDepthTexture ? (re && U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER, U.COLOR_ATTACHMENT0, yt.get(L).__webglTexture, I, ne + En), U.blitFramebuffer(mt, Ct, J, lt, gt, Yt, J, lt, U.DEPTH_BUFFER_BIT, U.NEAREST)) : re ? U.copyTexSubImage3D(Mt, I, gt, Yt, ne + En, mt, Ct, J, lt) : U.copyTexSubImage2D(Mt, I, gt, Yt, ne + En, mt, Ct, J, lt);
          bt.bindFramebuffer(U.READ_FRAMEBUFFER, null), bt.bindFramebuffer(U.DRAW_FRAMEBUFFER, null);
        } else re ? M.isDataTexture || M.isData3DTexture ? U.texSubImage3D(Mt, I, gt, Yt, ne, J, lt, pt, Pe, jt, se.data) : L.isCompressedArrayTexture ? U.compressedTexSubImage3D(Mt, I, gt, Yt, ne, J, lt, pt, Pe, se.data) : U.texSubImage3D(Mt, I, gt, Yt, ne, J, lt, pt, Pe, jt, se) : M.isDataTexture ? U.texSubImage2D(U.TEXTURE_2D, I, gt, Yt, J, lt, Pe, jt, se.data) : M.isCompressedTexture ? U.compressedTexSubImage2D(U.TEXTURE_2D, I, gt, Yt, se.width, se.height, Pe, se.data) : U.texSubImage2D(U.TEXTURE_2D, I, gt, Yt, J, lt, Pe, jt, se);
        U.pixelStorei(U.UNPACK_ROW_LENGTH, on), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, Kt), U.pixelStorei(U.UNPACK_SKIP_PIXELS, Xe), U.pixelStorei(U.UNPACK_SKIP_ROWS, ri), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Ne), I === 0 && L.generateMipmaps && U.generateMipmap(Mt), bt.unbindTexture();
      }, this.copyTextureToTexture3D = function(M, L, O = null, B = null, I = 0) {
        return M.isTexture !== true && (ts("WebGLRenderer: copyTextureToTexture3D function signature has changed."), O = arguments[0] || null, B = arguments[1] || null, M = arguments[2], L = arguments[3], I = arguments[4] || 0), ts('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'), this.copyTextureToTexture(M, L, O, B, I);
      }, this.initRenderTarget = function(M) {
        yt.get(M).__webglFramebuffer === void 0 && T.setupRenderTarget(M);
      }, this.initTexture = function(M) {
        M.isCubeTexture ? T.setTextureCube(M, 0) : M.isData3DTexture ? T.setTexture3D(M, 0) : M.isDataArrayTexture || M.isCompressedArrayTexture ? T.setTexture2DArray(M, 0) : T.setTexture2D(M, 0), bt.unbindTexture();
      }, this.resetState = function() {
        w = 0, A = 0, P = null, bt.reset(), ee.reset();
      }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
        detail: this
      }));
    }
    get coordinateSystem() {
      return mn;
    }
    get outputColorSpace() {
      return this._outputColorSpace;
    }
    set outputColorSpace(t) {
      this._outputColorSpace = t;
      const e = this.getContext();
      e.drawingBufferColorspace = Vt._getDrawingBufferColorSpace(t), e.unpackColorSpace = Vt._getUnpackColorSpace();
    }
  }
  class j_ extends Se {
    constructor() {
      super(), this.isScene = true, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new rn(), this.environmentIntensity = 1, this.environmentRotation = new rn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
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
  class K_ extends Re {
    constructor(t = null, e = 1, n = 1, s, r, a, o, l, c = ke, h = ke, d, f) {
      super(null, a, o, l, c, h, s, r, d, f), this.isDataTexture = true, this.image = {
        data: t,
        width: e,
        height: n
      }, this.generateMipmaps = false, this.flipY = false, this.unpackAlignment = 1;
    }
  }
  class Hl extends xe {
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
  const Mi = new qt(), Gl = new qt(), Is = [], Vl = new ni(), Z_ = new qt(), Ki = new he(), Zi = new ii();
  class Xn extends he {
    constructor(t, e, n) {
      super(t, e), this.isInstancedMesh = true, this.instanceMatrix = new Hl(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
      for (let s = 0; s < n; s++) this.setMatrixAt(s, Z_);
    }
    computeBoundingBox() {
      const t = this.geometry, e = this.count;
      this.boundingBox === null && (this.boundingBox = new ni()), t.boundingBox === null && t.computeBoundingBox(), this.boundingBox.makeEmpty();
      for (let n = 0; n < e; n++) this.getMatrixAt(n, Mi), Vl.copy(t.boundingBox).applyMatrix4(Mi), this.boundingBox.union(Vl);
    }
    computeBoundingSphere() {
      const t = this.geometry, e = this.count;
      this.boundingSphere === null && (this.boundingSphere = new ii()), t.boundingSphere === null && t.computeBoundingSphere(), this.boundingSphere.makeEmpty();
      for (let n = 0; n < e; n++) this.getMatrixAt(n, Mi), Zi.copy(t.boundingSphere).applyMatrix4(Mi), this.boundingSphere.union(Zi);
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
      if (Ki.geometry = this.geometry, Ki.material = this.material, Ki.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), Zi.copy(this.boundingSphere), Zi.applyMatrix4(n), t.ray.intersectsSphere(Zi) !== false)) for (let r = 0; r < s; r++) {
        this.getMatrixAt(r, Mi), Gl.multiplyMatrices(n, Mi), Ki.matrixWorld = Gl, Ki.raycast(t, Is);
        for (let a = 0, o = Is.length; a < o; a++) {
          const l = Is[a];
          l.instanceId = r, l.object = this, e.push(l);
        }
        Is.length = 0;
      }
    }
    setColorAt(t, e) {
      this.instanceColor === null && (this.instanceColor = new Hl(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), e.toArray(this.instanceColor.array, t * 3);
    }
    setMatrixAt(t, e) {
      e.toArray(this.instanceMatrix.array, t * 16);
    }
    setMorphAt(t, e) {
      const n = e.morphTargetInfluences, s = n.length + 1;
      this.morphTexture === null && (this.morphTexture = new K_(new Float32Array(s * this.count), s, this.count, ro, nn));
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
  class po extends si {
    static get type() {
      return "LineBasicMaterial";
    }
    constructor(t) {
      super(), this.isLineBasicMaterial = true, this.color = new Et(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
    }
  }
  const $s = new C(), Js = new C(), Wl = new qt(), $i = new ls(), Us = new ii(), Wr = new C(), Xl = new C();
  class gh extends Se {
    constructor(t = new Me(), e = new po()) {
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
        for (let s = 1, r = e.count; s < r; s++) $s.fromBufferAttribute(e, s - 1), Js.fromBufferAttribute(e, s), n[s] = n[s - 1], n[s] += $s.distanceTo(Js);
        t.setAttribute("lineDistance", new ue(n, 1));
      } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
      return this;
    }
    raycast(t, e) {
      const n = this.geometry, s = this.matrixWorld, r = t.params.Line.threshold, a = n.drawRange;
      if (n.boundingSphere === null && n.computeBoundingSphere(), Us.copy(n.boundingSphere), Us.applyMatrix4(s), Us.radius += r, t.ray.intersectsSphere(Us) === false) return;
      Wl.copy(s).invert(), $i.copy(t.ray).applyMatrix4(Wl);
      const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, c = this.isLineSegments ? 2 : 1, h = n.index, f = n.attributes.position;
      if (h !== null) {
        const p = Math.max(0, a.start), g = Math.min(h.count, a.start + a.count);
        for (let _ = p, m = g - 1; _ < m; _ += c) {
          const u = h.getX(_), E = h.getX(_ + 1), b = Ns(this, t, $i, l, u, E);
          b && e.push(b);
        }
        if (this.isLineLoop) {
          const _ = h.getX(g - 1), m = h.getX(p), u = Ns(this, t, $i, l, _, m);
          u && e.push(u);
        }
      } else {
        const p = Math.max(0, a.start), g = Math.min(f.count, a.start + a.count);
        for (let _ = p, m = g - 1; _ < m; _ += c) {
          const u = Ns(this, t, $i, l, _, _ + 1);
          u && e.push(u);
        }
        if (this.isLineLoop) {
          const _ = Ns(this, t, $i, l, g - 1, p);
          _ && e.push(_);
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
  function Ns(i, t, e, n, s, r) {
    const a = i.geometry.attributes.position;
    if ($s.fromBufferAttribute(a, s), Js.fromBufferAttribute(a, r), e.distanceSqToSegment($s, Js, Wr, Xl) > n) return;
    Wr.applyMatrix4(i.matrixWorld);
    const l = t.ray.origin.distanceTo(Wr);
    if (!(l < t.near || l > t.far)) return {
      distance: l,
      point: Xl.clone().applyMatrix4(i.matrixWorld),
      index: s,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: i
    };
  }
  class $_ extends gh {
    constructor(t, e) {
      super(t, e), this.isLineLoop = true, this.type = "LineLoop";
    }
  }
  class _h extends si {
    static get type() {
      return "PointsMaterial";
    }
    constructor(t) {
      super(), this.isPointsMaterial = true, this.color = new Et(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = true, this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, this;
    }
  }
  const Yl = new qt(), Ga = new ls(), Fs = new ii(), Os = new C();
  class vh extends Se {
    constructor(t = new Me(), e = new _h()) {
      super(), this.isPoints = true, this.type = "Points", this.geometry = t, this.material = e, this.updateMorphTargets();
    }
    copy(t, e) {
      return super.copy(t, e), this.material = Array.isArray(t.material) ? t.material.slice() : t.material, this.geometry = t.geometry, this;
    }
    raycast(t, e) {
      const n = this.geometry, s = this.matrixWorld, r = t.params.Points.threshold, a = n.drawRange;
      if (n.boundingSphere === null && n.computeBoundingSphere(), Fs.copy(n.boundingSphere), Fs.applyMatrix4(s), Fs.radius += r, t.ray.intersectsSphere(Fs) === false) return;
      Yl.copy(s).invert(), Ga.copy(t.ray).applyMatrix4(Yl);
      const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), l = o * o, c = n.index, d = n.attributes.position;
      if (c !== null) {
        const f = Math.max(0, a.start), p = Math.min(c.count, a.start + a.count);
        for (let g = f, _ = p; g < _; g++) {
          const m = c.getX(g);
          Os.fromBufferAttribute(d, m), ql(Os, m, l, s, t, e, this);
        }
      } else {
        const f = Math.max(0, a.start), p = Math.min(d.count, a.start + a.count);
        for (let g = f, _ = p; g < _; g++) Os.fromBufferAttribute(d, g), ql(Os, g, l, s, t, e, this);
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
  function ql(i, t, e, n, s, r, a) {
    const o = Ga.distanceSqToPoint(i);
    if (o < e) {
      const l = new C();
      Ga.closestPointToPoint(i, l), l.applyMatrix4(n);
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
  class mo extends Me {
    constructor(t = [], e = [], n = 1, s = 0) {
      super(), this.type = "PolyhedronGeometry", this.parameters = {
        vertices: t,
        indices: e,
        radius: n,
        detail: s
      };
      const r = [], a = [];
      o(s), c(n), h(), this.setAttribute("position", new ue(r, 3)), this.setAttribute("normal", new ue(r.slice(), 3)), this.setAttribute("uv", new ue(a, 2)), s === 0 ? this.computeVertexNormals() : this.normalizeNormals();
      function o(E) {
        const b = new C(), S = new C(), N = new C();
        for (let w = 0; w < e.length; w += 3) p(e[w + 0], b), p(e[w + 1], S), p(e[w + 2], N), l(b, S, N, E);
      }
      function l(E, b, S, N) {
        const w = N + 1, A = [];
        for (let P = 0; P <= w; P++) {
          A[P] = [];
          const y = E.clone().lerp(S, P / w), x = b.clone().lerp(S, P / w), R = w - P;
          for (let G = 0; G <= R; G++) G === 0 && P === w ? A[P][G] = y : A[P][G] = y.clone().lerp(x, G / R);
        }
        for (let P = 0; P < w; P++) for (let y = 0; y < 2 * (w - P) - 1; y++) {
          const x = Math.floor(y / 2);
          y % 2 === 0 ? (f(A[P][x + 1]), f(A[P + 1][x]), f(A[P][x])) : (f(A[P][x + 1]), f(A[P + 1][x + 1]), f(A[P + 1][x]));
        }
      }
      function c(E) {
        const b = new C();
        for (let S = 0; S < r.length; S += 3) b.x = r[S + 0], b.y = r[S + 1], b.z = r[S + 2], b.normalize().multiplyScalar(E), r[S + 0] = b.x, r[S + 1] = b.y, r[S + 2] = b.z;
      }
      function h() {
        const E = new C();
        for (let b = 0; b < r.length; b += 3) {
          E.x = r[b + 0], E.y = r[b + 1], E.z = r[b + 2];
          const S = m(E) / 2 / Math.PI + 0.5, N = u(E) / Math.PI + 0.5;
          a.push(S, 1 - N);
        }
        g(), d();
      }
      function d() {
        for (let E = 0; E < a.length; E += 6) {
          const b = a[E + 0], S = a[E + 2], N = a[E + 4], w = Math.max(b, S, N), A = Math.min(b, S, N);
          w > 0.9 && A < 0.1 && (b < 0.2 && (a[E + 0] += 1), S < 0.2 && (a[E + 2] += 1), N < 0.2 && (a[E + 4] += 1));
        }
      }
      function f(E) {
        r.push(E.x, E.y, E.z);
      }
      function p(E, b) {
        const S = E * 3;
        b.x = t[S + 0], b.y = t[S + 1], b.z = t[S + 2];
      }
      function g() {
        const E = new C(), b = new C(), S = new C(), N = new C(), w = new _t(), A = new _t(), P = new _t();
        for (let y = 0, x = 0; y < r.length; y += 9, x += 6) {
          E.set(r[y + 0], r[y + 1], r[y + 2]), b.set(r[y + 3], r[y + 4], r[y + 5]), S.set(r[y + 6], r[y + 7], r[y + 8]), w.set(a[x + 0], a[x + 1]), A.set(a[x + 2], a[x + 3]), P.set(a[x + 4], a[x + 5]), N.copy(E).add(b).add(S).divideScalar(3);
          const R = m(N);
          _(w, x + 0, E, R), _(A, x + 2, b, R), _(P, x + 4, S, R);
        }
      }
      function _(E, b, S, N) {
        N < 0 && E.x === 1 && (a[b] = E.x - 1), S.x === 0 && S.z === 0 && (a[b] = N / 2 / Math.PI + 0.5);
      }
      function m(E) {
        return Math.atan2(E.z, -E.x);
      }
      function u(E) {
        return Math.atan2(-E.y, Math.sqrt(E.x * E.x + E.z * E.z));
      }
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new mo(t.vertices, t.indices, t.radius, t.details);
    }
  }
  class go extends mo {
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
      return new go(t.radius, t.detail);
    }
  }
  class hr extends Me {
    constructor(t = 0.5, e = 1, n = 32, s = 1, r = 0, a = Math.PI * 2) {
      super(), this.type = "RingGeometry", this.parameters = {
        innerRadius: t,
        outerRadius: e,
        thetaSegments: n,
        phiSegments: s,
        thetaStart: r,
        thetaLength: a
      }, n = Math.max(3, n), s = Math.max(1, s);
      const o = [], l = [], c = [], h = [];
      let d = t;
      const f = (e - t) / s, p = new C(), g = new _t();
      for (let _ = 0; _ <= s; _++) {
        for (let m = 0; m <= n; m++) {
          const u = r + m / n * a;
          p.x = d * Math.cos(u), p.y = d * Math.sin(u), l.push(p.x, p.y, p.z), c.push(0, 0, 1), g.x = (p.x / e + 1) / 2, g.y = (p.y / e + 1) / 2, h.push(g.x, g.y);
        }
        d += f;
      }
      for (let _ = 0; _ < s; _++) {
        const m = _ * (n + 1);
        for (let u = 0; u < n; u++) {
          const E = u + m, b = E, S = E + n + 1, N = E + n + 2, w = E + 1;
          o.push(b, S, w), o.push(S, N, w);
        }
      }
      this.setIndex(o), this.setAttribute("position", new ue(l, 3)), this.setAttribute("normal", new ue(c, 3)), this.setAttribute("uv", new ue(h, 2));
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new hr(t.innerRadius, t.outerRadius, t.thetaSegments, t.phiSegments, t.thetaStart, t.thetaLength);
    }
  }
  class gn extends Me {
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
      const h = [], d = new C(), f = new C(), p = [], g = [], _ = [], m = [];
      for (let u = 0; u <= n; u++) {
        const E = [], b = u / n;
        let S = 0;
        u === 0 && a === 0 ? S = 0.5 / e : u === n && l === Math.PI && (S = -0.5 / e);
        for (let N = 0; N <= e; N++) {
          const w = N / e;
          d.x = -t * Math.cos(s + w * r) * Math.sin(a + b * o), d.y = t * Math.cos(a + b * o), d.z = t * Math.sin(s + w * r) * Math.sin(a + b * o), g.push(d.x, d.y, d.z), f.copy(d).normalize(), _.push(f.x, f.y, f.z), m.push(w + S, 1 - b), E.push(c++);
        }
        h.push(E);
      }
      for (let u = 0; u < n; u++) for (let E = 0; E < e; E++) {
        const b = h[u][E + 1], S = h[u][E], N = h[u + 1][E], w = h[u + 1][E + 1];
        (u !== 0 || a > 0) && p.push(b, S, w), (u !== n - 1 || l < Math.PI) && p.push(S, N, w);
      }
      this.setIndex(p), this.setAttribute("position", new ue(g, 3)), this.setAttribute("normal", new ue(_, 3)), this.setAttribute("uv", new ue(m, 2));
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new gn(t.radius, t.widthSegments, t.heightSegments, t.phiStart, t.phiLength, t.thetaStart, t.thetaLength);
    }
  }
  class _o extends Me {
    constructor(t = 1, e = 0.4, n = 12, s = 48, r = Math.PI * 2) {
      super(), this.type = "TorusGeometry", this.parameters = {
        radius: t,
        tube: e,
        radialSegments: n,
        tubularSegments: s,
        arc: r
      }, n = Math.floor(n), s = Math.floor(s);
      const a = [], o = [], l = [], c = [], h = new C(), d = new C(), f = new C();
      for (let p = 0; p <= n; p++) for (let g = 0; g <= s; g++) {
        const _ = g / s * r, m = p / n * Math.PI * 2;
        d.x = (t + e * Math.cos(m)) * Math.cos(_), d.y = (t + e * Math.cos(m)) * Math.sin(_), d.z = e * Math.sin(m), o.push(d.x, d.y, d.z), h.x = t * Math.cos(_), h.y = t * Math.sin(_), f.subVectors(d, h).normalize(), l.push(f.x, f.y, f.z), c.push(g / s), c.push(p / n);
      }
      for (let p = 1; p <= n; p++) for (let g = 1; g <= s; g++) {
        const _ = (s + 1) * p + g - 1, m = (s + 1) * (p - 1) + g - 1, u = (s + 1) * (p - 1) + g, E = (s + 1) * p + g;
        a.push(_, m, E), a.push(m, u, E);
      }
      this.setIndex(a), this.setAttribute("position", new ue(o, 3)), this.setAttribute("normal", new ue(l, 3)), this.setAttribute("uv", new ue(c, 2));
    }
    copy(t) {
      return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
      return new _o(t.radius, t.tube, t.radialSegments, t.tubularSegments, t.arc);
    }
  }
  class J_ extends ae {
    static get type() {
      return "RawShaderMaterial";
    }
    constructor(t) {
      super(t), this.isRawShaderMaterial = true;
    }
  }
  class Bs extends si {
    static get type() {
      return "MeshStandardMaterial";
    }
    constructor(t) {
      super(), this.isMeshStandardMaterial = true, this.defines = {
        STANDARD: ""
      }, this.color = new Et(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Et(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = $c, this.normalScale = new _t(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new rn(), this.envMapIntensity = 1, this.wireframe = false, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = false, this.fog = true, this.setValues(t);
    }
    copy(t) {
      return super.copy(t), this.defines = {
        STANDARD: ""
      }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, this.envMapRotation.copy(t.envMapRotation), this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, this.fog = t.fog, this;
    }
  }
  class xh extends Se {
    constructor(t, e = 1) {
      super(), this.isLight = true, this.type = "Light", this.color = new Et(t), this.intensity = e;
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
  const Xr = new qt(), jl = new C(), Kl = new C();
  class Q_ {
    constructor(t) {
      this.camera = t, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new _t(512, 512), this.map = null, this.mapPass = null, this.matrix = new qt(), this.autoUpdate = true, this.needsUpdate = false, this._frustum = new uo(), this._frameExtents = new _t(1, 1), this._viewportCount = 1, this._viewports = [
        new Qt(0, 0, 1, 1)
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
      jl.setFromMatrixPosition(t.matrixWorld), e.position.copy(jl), Kl.setFromMatrixPosition(t.target.matrixWorld), e.lookAt(Kl), e.updateMatrixWorld(), Xr.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Xr), n.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1), n.multiply(Xr);
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
  const Zl = new qt(), Ji = new C(), Yr = new C();
  class t0 extends Q_ {
    constructor() {
      super(new Ie(90, 1, 0.5, 500)), this.isPointLightShadow = true, this._frameExtents = new _t(4, 2), this._viewportCount = 6, this._viewports = [
        new Qt(2, 1, 1, 1),
        new Qt(0, 1, 1, 1),
        new Qt(3, 1, 1, 1),
        new Qt(1, 1, 1, 1),
        new Qt(3, 0, 1, 1),
        new Qt(1, 0, 1, 1)
      ], this._cubeDirections = [
        new C(1, 0, 0),
        new C(-1, 0, 0),
        new C(0, 0, 1),
        new C(0, 0, -1),
        new C(0, 1, 0),
        new C(0, -1, 0)
      ], this._cubeUps = [
        new C(0, 1, 0),
        new C(0, 1, 0),
        new C(0, 1, 0),
        new C(0, 1, 0),
        new C(0, 0, 1),
        new C(0, 0, -1)
      ];
    }
    updateMatrices(t, e = 0) {
      const n = this.camera, s = this.matrix, r = t.distance || n.far;
      r !== n.far && (n.far = r, n.updateProjectionMatrix()), Ji.setFromMatrixPosition(t.matrixWorld), n.position.copy(Ji), Yr.copy(n.position), Yr.add(this._cubeDirections[e]), n.up.copy(this._cubeUps[e]), n.lookAt(Yr), n.updateMatrixWorld(), s.makeTranslation(-Ji.x, -Ji.y, -Ji.z), Zl.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Zl);
    }
  }
  class $l extends xh {
    constructor(t, e, n = 0, s = 2) {
      super(t, e), this.isPointLight = true, this.type = "PointLight", this.distance = n, this.decay = s, this.shadow = new t0();
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
  class e0 extends xh {
    constructor(t, e) {
      super(t, e), this.isAmbientLight = true, this.type = "AmbientLight";
    }
  }
  let n0 = class {
    constructor(t = true) {
      this.autoStart = t, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = false;
    }
    start() {
      this.startTime = Jl(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = true;
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
        const e = Jl();
        t = (e - this.oldTime) / 1e3, this.oldTime = e, this.elapsedTime += t;
      }
      return t;
    }
  };
  function Jl() {
    return performance.now();
  }
  const Ql = new qt();
  class i0 {
    constructor(t, e, n = 0, s = 1 / 0) {
      this.ray = new ls(t, e), this.near = n, this.far = s, this.camera = null, this.layers = new ho(), this.params = {
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
      return Ql.identity().extractRotation(t.matrixWorld), this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Ql), this;
    }
    intersectObject(t, e = true, n = []) {
      return Va(t, this, n, e), n.sort(tc), n;
    }
    intersectObjects(t, e = true, n = []) {
      for (let s = 0, r = t.length; s < r; s++) Va(t[s], this, n, e);
      return n.sort(tc), n;
    }
  }
  function tc(i, t) {
    return i.distance - t.distance;
  }
  function Va(i, t, e, n) {
    let s = true;
    if (i.layers.test(t.layers) && i.raycast(t, e) === false && (s = false), s === true && n === true) {
      const r = i.children;
      for (let a = 0, o = r.length; a < o; a++) Va(r[a], t, e, true);
    }
  }
  class ec {
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
      return this.radius = Math.sqrt(t * t + e * e + n * n), this.radius === 0 ? (this.theta = 0, this.phi = 0) : (this.theta = Math.atan2(t, n), this.phi = Math.acos(Te(e / this.radius, -1, 1))), this;
    }
    clone() {
      return new this.constructor().copy(this);
    }
  }
  class s0 extends ei {
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
      revision: to
    }
  }));
  typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = to);
  const ur = 0.02, r0 = 4, vo = 1 / 8;
  function xo(i) {
    return !Number.isFinite(i) || i <= 0 ? 0 : Math.min(i / ur, r0);
  }
  function pn(i, t) {
    const e = Math.sin((Math.abs(i) + 1) * 127.1 + t * 311.7) * 43758.5453;
    return e - Math.floor(e);
  }
  function a0(i, t = ur) {
    const e = Ja(i);
    return e >= Sh ? 2 : xo(t) < vo ? 3 : e >= Mh ? 1 : 0;
  }
  const o0 = {
    0: [
      {
        r: 0.62,
        g: 0.45,
        b: 0.33
      },
      {
        r: 0.55,
        g: 0.53,
        b: 0.5
      },
      {
        r: 0.78,
        g: 0.71,
        b: 0.55
      },
      {
        r: 0.33,
        g: 0.47,
        b: 0.56
      },
      {
        r: 0.45,
        g: 0.4,
        b: 0.36
      }
    ],
    1: [
      {
        r: 0.35,
        g: 0.62,
        b: 0.78
      },
      {
        r: 0.24,
        g: 0.42,
        b: 0.78
      },
      {
        r: 0.44,
        g: 0.7,
        b: 0.72
      }
    ],
    2: [
      {
        r: 0.79,
        g: 0.66,
        b: 0.48
      },
      {
        r: 0.85,
        g: 0.76,
        b: 0.55
      },
      {
        r: 0.72,
        g: 0.5,
        b: 0.36
      },
      {
        r: 0.66,
        g: 0.6,
        b: 0.7
      }
    ],
    3: [
      {
        r: 0.58,
        g: 0.63,
        b: 0.7
      },
      {
        r: 0.66,
        g: 0.68,
        b: 0.71
      },
      {
        r: 0.6,
        g: 0.66,
        b: 0.68
      }
    ]
  }, l0 = 4;
  function c0(i, t, e = ur) {
    const n = a0(t, e), s = o0[n], r = Math.floor(pn(i, 1) * s.length) % s.length, a = s[r] ?? s[0], o = 0.85 + 0.3 * pn(i, 2), l = xo(e) >= vo, c = pn(i, 5);
    let h, d;
    return n === 2 && l ? (h = c < 0.3, d = h ? 1 : 0) : n === 1 && l ? (h = c < 0.25, d = h ? 0.3 : 0) : (h = false, d = 0), {
      planetClass: n,
      color: {
        r: Math.min(1, a.r * o),
        g: Math.min(1, a.g * o),
        b: Math.min(1, a.b * o)
      },
      axialTilt: (pn(i, 3) < 0.8 ? 0.6 : 1.9) * (pn(i, 4) - 0.5) * 2,
      hasRings: h,
      ringProminence: d,
      moonCount: l ? h0(n, i) : 0
    };
  }
  function h0(i, t) {
    const e = pn(t, 6);
    switch (i) {
      case 2:
        return 3 + (e < 0.5 ? 0 : 1);
      case 1:
        return 2 + (e < 0.6 ? 0 : 1);
      default:
        return e < 0.3 ? 1 : 0;
    }
  }
  function u0(i, t) {
    const e = pn(i, 20 + t);
    return {
      radiusFactor: 6 * Math.pow(1.8, t) * (0.9 + 0.2 * e),
      tilt: (pn(i, 40 + t) - 0.5) * 0.9,
      phase: e * Math.PI * 2,
      angularSpeed: 0.85 * Math.pow(1 + t * 0.62, -1.5) * (0.85 + 0.3 * e),
      sizeFactor: 0.16 + 0.07 * pn(i, 60 + t)
    };
  }
  function d0(i, t) {
    const e = i.phase + t * i.angularSpeed, n = Math.cos(e) * i.radiusFactor, s = Math.sin(e) * i.radiusFactor;
    return [
      n,
      -s * Math.sin(i.tilt),
      s * Math.cos(i.tilt)
    ];
  }
  const Mh = 8, Sh = 50;
  function Wa(i) {
    if (i >= $n.hydrogenBurningMinMass) return "info.companionStar.title";
    if (i >= $n.deuteriumBurningMinMass) return "info.brownDwarfCompanion.title";
    const t = Ja(i);
    return t >= Sh ? "info.gasGiant.title" : t >= Mh ? "info.iceGiant.title" : "info.rockyPlanet.title";
  }
  function f0(i) {
    return i.kind === "star" ? p0(i) : _0(i);
  }
  function p0(i) {
    const t = m0(i);
    return i.discMetallicity === void 0 || xo(i.discMetallicity) >= vo ? t : {
      ...t,
      noteId: "info.note.noPlanets"
    };
  }
  function m0(i) {
    switch (i.stage) {
      case nt.DustCloud:
      case nt.ProtostarCoalescence:
        return {
          titleId: "info.protostar.title",
          descId: "info.protostar.desc"
        };
      case nt.FusionIgnition:
      case nt.MainSequence:
        return {
          titleId: "info.mainSequenceStar.title",
          descId: "info.mainSequenceStar.desc"
        };
      case nt.RedGiant:
        return {
          titleId: "info.redGiant.title",
          descId: "info.redGiant.desc"
        };
      case nt.Death:
        return {
          titleId: "info.dyingStar.title",
          descId: "info.dyingStar.desc"
        };
      case nt.Remnant:
        return g0(i.remnant);
      default:
        return {
          titleId: "info.mainSequenceStar.title",
          descId: "info.mainSequenceStar.desc"
        };
    }
  }
  function g0(i) {
    switch (i) {
      case Pt.BrownDwarf:
        return {
          titleId: "info.brownDwarf.title",
          descId: "info.brownDwarf.desc"
        };
      case Pt.NeutronStar:
        return {
          titleId: "info.neutronStar.title",
          descId: "info.neutronStar.desc"
        };
      case Pt.Pulsar:
        return {
          titleId: "info.pulsar.title",
          descId: "info.pulsar.desc"
        };
      case Pt.BlackHole:
        return {
          titleId: "info.blackHole.title",
          descId: "info.blackHole.desc"
        };
      case Pt.WhiteDwarf:
      default:
        return {
          titleId: "info.whiteDwarf.title",
          descId: "info.whiteDwarf.desc"
        };
    }
  }
  function _0(i) {
    const t = i.captured ? "info.note.captured" : "info.note.passing";
    switch (i.type) {
      case kt.Comet:
        return {
          titleId: "info.comet.title",
          descId: "info.comet.desc",
          noteId: t
        };
      case kt.Asteroid:
        return {
          titleId: "info.asteroid.title",
          descId: "info.asteroid.desc",
          noteId: t
        };
      case kt.Star:
        return {
          titleId: "info.companionStar.title",
          descId: "info.companionStar.desc"
        };
      case kt.BrownDwarf:
        return {
          titleId: "info.brownDwarfCompanion.title",
          descId: "info.brownDwarfCompanion.desc"
        };
      case kt.Planet:
      case kt.Protoplanet:
      default: {
        const e = Wa(i.mass ?? 0), n = `${e.slice(0, -6)}.desc`;
        return {
          titleId: e,
          descId: n
        };
      }
    }
  }
  nt.DustCloud, nt.ProtostarCoalescence, nt.FusionIgnition, nt.MainSequence, nt.RedGiant, nt.Death, nt.Remnant;
  const nc = {
    [nt.ProtostarCoalescence]: Le.CollapseOnset,
    [nt.FusionIgnition]: Le.ProtostarFormed,
    [nt.MainSequence]: Le.FusionIgnition,
    [nt.RedGiant]: Le.RedGiantOnset,
    [nt.Death]: Le.DeathEvent,
    [nt.Remnant]: Le.RemnantFormed
  }, v0 = {
    shockBreakout: 0.12,
    peakLuminosity: 0.34
  }, yh = {
    deathSweep: 0.6,
    remnantSweep: 3.25
  };
  function le(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  const qr = 1.9;
  function x0(i, t, e) {
    return 0.2126 * i + 0.7152 * t + 0.0722 * e;
  }
  function me(i) {
    const t = le(i, 1e3, 4e4) / 100;
    let e, n, s;
    t <= 66 ? (e = 255, n = 99.4708025861 * Math.log(t) - 161.1195681661) : (e = 329.698727446 * Math.pow(t - 60, -0.1332047592), n = 288.1221695283 * Math.pow(t - 60, -0.0755148492)), t >= 66 ? s = 255 : t <= 19 ? s = 0 : s = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
    const r = le(e, 0, 255) / 255, a = le(n, 0, 255) / 255, o = le(s, 0, 255) / 255, l = x0(r, a, o), c = Math.max(0, l + (r - l) * qr), h = Math.max(0, l + (a - l) * qr), d = Math.max(0, l + (o - l) * qr), f = Math.max(c, h, d, Number.EPSILON);
    return {
      r: le(c / f, 0, 1),
      g: le(h / f, 0, 1),
      b: le(d / f, 0, 1)
    };
  }
  const Xa = {
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
    pulsarBeam: false,
    surfaceDetail: 0,
    magnetosphere: false,
    blackHole: false,
    shockwave: 0,
    shockwaveRadius: 0,
    shockwaveColor: {
      r: 0,
      g: 0,
      b: 0
    }
  }, Ke = {
    magnetosphere: false,
    blackHole: false,
    shockwave: 0,
    shockwaveRadius: 0,
    shockwaveColor: {
      r: 0,
      g: 0,
      b: 0
    }
  };
  function Fi(i) {
    const t = Math.max(i, 1e-3);
    return le(5800 * Math.pow(t, 0.6), 2400, 45e3);
  }
  function Mo(i) {
    return Za * ea(Math.max(i, 1e-3));
  }
  const Eh = 5e-4;
  function So(i) {
    return le(Mo(i), Eh, 0.05);
  }
  const M0 = 250;
  function bh(i) {
    return Mo(i) * M0;
  }
  const S0 = 1.5;
  function Ya(i) {
    return So(i) * S0;
  }
  const y0 = 4;
  function E0(i) {
    const t = Math.max(i, 1e-3), e = Za * y0 * Math.sqrt(t);
    return Math.max(e, Ya(t) * 1.15);
  }
  const b0 = 3.5, Th = 4;
  function wh(i, t) {
    const e = le(t, 0, Th);
    return Math.max(i, 0) * (b0 + e);
  }
  const T0 = 1.6;
  function Ah(i, t = 1) {
    const e = Math.min(1, 0.35 + Math.max(i, 0) * 0.25), n = 1 + 0.06 * Math.max(0, i - Th);
    return le(e * n * Math.max(t, 1), 0, T0);
  }
  const Ch = 43e-6, qa = 1e-5, w0 = 1e-5, Rh = Eh, Qs = 1800, A0 = 1.6, C0 = 0.35, R0 = 0.12;
  function Ph(i) {
    const t = Number.isFinite(i) ? Math.max(i, 0) : 0;
    if (!(t >= $n.hydrogenBurningMinMass)) return {
      star: false,
      temperatureK: Qs,
      color: me(Qs),
      radius: Rh,
      glow: R0,
      surfaceLum: 0.35
    };
    const n = Fi(t);
    return {
      star: true,
      temperatureK: n,
      color: me(n),
      radius: So(t),
      glow: le(Math.sqrt(t), C0, A0),
      surfaceLum: 0.7
    };
  }
  function yo(i) {
    if (i === null) return 1;
    const t = Math.max(0, i.metals);
    return le(1 - (t - 0.02) * 1.2, 0.85, 1.12);
  }
  function P0(i, t, e = null) {
    const n = le(t, 0, 1), s = Fi(i) * yo(e), r = 1.15 - 0.25 * n;
    return le(s * r, 2500, 4e4);
  }
  function D0(i, t, e, n = null, s = null, r = false, a = bo) {
    const o = le(e, 0, 1), l = Fi(t) * yo(s), c = So(t);
    switch (i) {
      case nt.DustCloud:
        return Xa;
      case nt.ProtostarCoalescence: {
        const h = 1200 + 1600 * o, d = E0(t), f = d + (Ya(t) - d) * o;
        return {
          visible: true,
          temperatureK: h,
          color: me(h),
          radius: f,
          glow: 0.4 + 0.3 * o,
          surfaceLum: 0.4 + 0.15 * o,
          pulsarBeam: false,
          surfaceDetail: 1,
          ...Ke
        };
      }
      case nt.FusionIgnition: {
        const h = 2800 + (l - 2800) * o, d = Ya(t), f = d + (c - d) * o;
        return {
          visible: true,
          temperatureK: h,
          color: me(h),
          radius: f,
          glow: 0.8 + 0.6 * o,
          surfaceLum: 0.55 + 0.35 * o,
          pulsarBeam: false,
          surfaceDetail: 1,
          ...Ke
        };
      }
      case nt.MainSequence: {
        const h = P0(t, o, s);
        return {
          visible: true,
          temperatureK: h,
          color: me(h),
          radius: c,
          glow: 1,
          surfaceLum: 0.7,
          pulsarBeam: false,
          surfaceDetail: 1,
          ...Ke
        };
      }
      case nt.RedGiant: {
        const h = Math.sqrt(o), d = l + (3100 - l) * h, f = c + (bh(t) - c) * o;
        return {
          visible: true,
          temperatureK: d,
          color: me(d),
          radius: f,
          glow: 1 + 0.5 * o,
          surfaceLum: 0.45 - 0.2 * h,
          pulsarBeam: false,
          surfaceDetail: 1,
          ...Ke
        };
      }
      case nt.Death:
        return N0(t, o, r, s, a);
      case nt.Remnant:
        return B0(n, o, a, r);
      default:
        return Xa;
    }
  }
  const L0 = 350, ic = {
    supernova: 1.5,
    nebula: 1.4
  }, tr = yh.deathSweep, I0 = yh.remnantSweep;
  function er(i, t, e) {
    const n = i ? ic.supernova : ic.nebula;
    return Math.max(e, 1) * n * (1 - Math.exp(-Math.max(t, 0)));
  }
  const Eo = 0.35, os = 13e3, U0 = 3600, bo = 50, Qi = 4e4;
  function N0(i, t, e, n = null, s = bo) {
    const r = le(t, 0, 1), a = Mo(i), o = Fi(i) * yo(n), l = bh(i), c = Math.max(s, 1), { shockBreakout: h, peakLuminosity: d } = v0;
    if (!e) return F0(l, r, c);
    if (r < h) {
      const P = r / h, y = o * (1 + 0.5 * P);
      return {
        visible: true,
        temperatureK: y,
        color: me(y),
        radius: l * (1 - 0.82 * P * P),
        glow: 1.4 - 0.9 * P,
        surfaceLum: 0.5 - 0.22 * P,
        pulsarBeam: false,
        surfaceDetail: 1,
        ...Ke
      };
    }
    const f = (r - h) / (1 - h), p = (d - h) / (1 - h), g = 1 - Math.exp(-6 * f), _ = f <= p ? 0 : Math.pow((f - p) / (1 - p), 1.5), m = a * (0.18 + L0 * g), u = Math.max(qa, m * (1 - 0.995 * _)), E = le(Qi * Math.pow(1 - 0.985 * f, 1.6) + 3400, 3400, Qi), b = f <= p ? Math.pow(f / Math.max(p, 1e-6), 0.35) : 1, S = f <= p ? 1 : Math.pow(1 - (f - p) / (1 - p), 1.4), N = Math.exp(-Math.pow(f / 0.06, 2)), w = b * S, A = le(Qi * (1 - 0.8 * f) + os - 0.2 * Qi, os, Qi);
    return {
      visible: true,
      temperatureK: E,
      color: me(E),
      radius: u,
      glow: 1 + 4.5 * w + 9 * N,
      surfaceLum: le(0.55 + 0.45 * w, 0, 1) * (1 - 0.9 * _),
      pulsarBeam: false,
      surfaceDetail: 0.15,
      magnetosphere: false,
      blackHole: false,
      shockwave: le(Eo + 0.65 * S, 0, 1),
      shockwaveRadius: er(true, tr * f, c),
      shockwaveColor: me(A)
    };
  }
  function F0(i, t, e) {
    if (t < 0.55) {
      const a = t / 0.55, o = 3300 - 400 * a;
      return {
        visible: true,
        temperatureK: o,
        color: me(o),
        radius: i * (1 + 0.35 * a),
        glow: 1.4 + 0.5 * a,
        surfaceLum: 0.4 - 0.12 * a,
        pulsarBeam: false,
        surfaceDetail: 1,
        magnetosphere: false,
        blackHole: false,
        shockwave: 0.45 * a,
        shockwaveRadius: er(false, tr * t, e),
        shockwaveColor: me(4200)
      };
    }
    const s = (t - 0.55) / (1 - 0.55), r = le(3e3 + 37e3 * Math.pow(s, 0.7), 3e3, 4e4);
    return {
      visible: true,
      temperatureK: r,
      color: me(r),
      radius: Math.max(Ch, i * 1.35 * Math.pow(1 - s, 2.4)),
      glow: 1.9 - 0.6 * s,
      surfaceLum: 0.35 + 0.6 * s,
      pulsarBeam: false,
      surfaceDetail: 1 - 0.7 * s,
      magnetosphere: false,
      blackHole: false,
      shockwave: 0.45 + (Eo - 0.45) * s,
      shockwaveRadius: er(false, tr * t, e),
      shockwaveColor: me(4200 + (os - 4200) * s)
    };
  }
  const ks = 4e4;
  function O0(i, t, e) {
    const n = le(i, 0, 1), s = os - (os - U0) * Math.pow(n, 0.7);
    return {
      shockwave: Eo * Math.pow(1 - n, 1.5),
      shockwaveRadius: er(t, tr + I0 * n, e),
      shockwaveColor: me(s)
    };
  }
  function B0(i, t = 0, e = bo, n = false) {
    const s = i === null || i === Pt.BrownDwarf ? Ke : O0(t, n, e);
    switch (i) {
      case Pt.BrownDwarf:
        return {
          visible: true,
          temperatureK: Qs,
          color: me(Qs),
          radius: Rh,
          glow: 0.45,
          surfaceLum: 0.35,
          pulsarBeam: false,
          surfaceDetail: 0.85,
          ...Ke
        };
      case Pt.WhiteDwarf:
        return {
          visible: true,
          temperatureK: 7200,
          color: me(7200),
          radius: Ch,
          glow: 1.2,
          surfaceLum: 0.95,
          pulsarBeam: false,
          surfaceDetail: 0.25,
          ...Ke,
          ...s
        };
      case Pt.NeutronStar:
        return {
          visible: true,
          temperatureK: ks,
          color: me(ks),
          radius: qa,
          glow: 2.4,
          surfaceLum: 1,
          pulsarBeam: false,
          surfaceDetail: 0,
          ...Ke,
          ...s,
          magnetosphere: true
        };
      case Pt.Pulsar:
        return {
          visible: true,
          temperatureK: ks,
          color: me(ks),
          radius: qa,
          glow: 2.6,
          surfaceLum: 1,
          pulsarBeam: true,
          surfaceDetail: 0,
          ...Ke,
          ...s,
          magnetosphere: true
        };
      case Pt.BlackHole:
        return {
          visible: true,
          temperatureK: 22e3,
          color: me(22e3),
          radius: w0,
          glow: 1.8,
          surfaceLum: 0,
          pulsarBeam: false,
          surfaceDetail: 0,
          ...Ke,
          ...s,
          blackHole: true
        };
      default:
        return Xa;
    }
  }
  function nr(i) {
    return !Number.isFinite(i) || i <= 0 ? "\u2014" : i >= 1e6 ? `${(i / 1e6).toPrecision(3)} MK` : i >= 1e4 ? `${Math.round(i / 100) / 10} kK` : `${Math.round(i)} K`;
  }
  function dr(i) {
    if (!Number.isFinite(i) || i <= 0) return "\u2014";
    if (!ar(i)) {
      const t = Ja(i);
      return t >= 1e3 ? `${Math.round(t).toLocaleString("en-US")} M\u2295` : `${t >= 10 ? Math.round(t) : Number(t.toPrecision(2))} M\u2295`;
    }
    return `${Number(i.toPrecision(3))} M\u2609`;
  }
  function Dh(i) {
    return !Number.isFinite(i) || i <= 0 ? "\u2014" : `${i >= 100 ? Math.round(i) : Number(i.toPrecision(3))} km/s`;
  }
  function Lh(i) {
    const t = $a(i);
    return t > 0 ? `${t >= 10 ? Math.round(t) : Number(t.toPrecision(2))} AU` : "\u2014";
  }
  function Ih(i, t, e) {
    switch (i) {
      case nt.DustCloud:
        return 20;
      case nt.ProtostarCoalescence:
        return 2500;
      case nt.FusionIgnition:
        return 4e3;
      case nt.MainSequence:
        return Fi(t);
      case nt.RedGiant:
        return 3300;
      case nt.Death:
        return 8e3;
      case nt.Remnant:
        switch (e) {
          case Pt.BrownDwarf:
            return 1800;
          case Pt.NeutronStar:
            return 6e5;
          case Pt.Pulsar:
            return 8e5;
          case Pt.BlackHole:
            return 0;
          case Pt.WhiteDwarf:
          default:
            return 15e3;
        }
      default:
        return Fi(t);
    }
  }
  function k0(i, t, e) {
    const n = Ih(i, t, e), s = pu(i, t, e);
    return {
      titleId: z0(i, e),
      stats: [
        {
          labelId: "label.stat.mass",
          value: dr(t)
        },
        {
          labelId: "label.stat.coreTemp",
          value: nr(s)
        },
        {
          labelId: "label.stat.surfaceTemp",
          value: nr(n)
        }
      ]
    };
  }
  function z0(i, t) {
    switch (i) {
      case nt.DustCloud:
      case nt.ProtostarCoalescence:
        return "info.protostar.title";
      case nt.RedGiant:
        return "info.redGiant.title";
      case nt.Death:
        return "info.dyingStar.title";
      case nt.Remnant:
        switch (t) {
          case Pt.BrownDwarf:
            return "info.brownDwarf.title";
          case Pt.NeutronStar:
            return "info.neutronStar.title";
          case Pt.Pulsar:
            return "info.pulsar.title";
          case Pt.BlackHole:
            return "info.blackHole.title";
          case Pt.WhiteDwarf:
          default:
            return "info.whiteDwarf.title";
        }
      default:
        return "info.mainSequenceStar.title";
    }
  }
  function H0(i, t, e, n = nt.MainSequence, s = null) {
    if (Uh(i.type, i.mass)) return G0(i, t);
    const r = $a(i.distanceScene), a = du(n, t, s), o = fu(e, a, r, 0.3), l = Pc(t, r);
    return {
      titleId: Nh(i),
      titleValues: {
        id: i.id
      },
      stats: [
        {
          labelId: "label.stat.mass",
          value: dr(i.mass)
        },
        {
          labelId: "label.stat.surfaceTemp",
          value: nr(o)
        },
        {
          labelId: "label.stat.velocity",
          value: Dh(l)
        },
        {
          labelId: "label.stat.distance",
          value: Lh(i.distanceScene)
        }
      ]
    };
  }
  function Uh(i, t) {
    return i === kt.Star || i === kt.BrownDwarf || ar(t);
  }
  function G0(i, t) {
    const e = Ph(i.mass), n = $a(i.distanceScene), s = Pc(t, n);
    return {
      titleId: Nh(i),
      titleValues: {
        id: i.id
      },
      stats: [
        {
          labelId: "label.stat.mass",
          value: dr(i.mass)
        },
        {
          labelId: "label.stat.surfaceTemp",
          value: nr(e.temperatureK)
        },
        {
          labelId: "label.stat.velocity",
          value: Dh(s)
        },
        {
          labelId: "label.stat.distance",
          value: Lh(i.distanceScene)
        }
      ]
    };
  }
  function Nh(i) {
    switch (i.type) {
      case kt.Comet:
        return "info.comet.title";
      case kt.Asteroid:
        return "info.asteroid.title";
      case kt.Star:
        return "info.companionStar.title";
      case kt.BrownDwarf:
        return "info.brownDwarfCompanion.title";
      case kt.Protoplanet:
        return ar(i.mass) ? Wa(i.mass) : "info.protoplanet.title";
      case kt.Planet:
      default:
        return Wa(i.mass);
    }
  }
  const sc = 48, V0 = 900, W0 = 0.035;
  class X0 {
    container;
    i18n;
    locale;
    pool = [];
    projected = new C();
    enabled = false;
    constructor(t) {
      this.container = t.container, this.i18n = t.i18n ?? ti, this.locale = t.locale;
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
        l,
        0
      ], k0(r, a, o), n, c, h, true);
      const f = Ih(r, a, o);
      for (let p = 0; p < e && d < sc; p += 1) {
        const g = p * Nn, _ = t[g + Bt.x] ?? 0, m = t[g + Bt.y] ?? 0, u = t[g + Bt.z] ?? 0, E = t[g + Bt.radius] ?? 0.1, b = Math.round(t[g + Bt.type] ?? 0), S = t[g + Bt.mass] ?? 0, N = H0({
          id: Math.round(t[g + Bt.id] ?? 0),
          type: b,
          mass: S,
          distanceScene: Math.hypot(_, m, u)
        }, a, f, r, o);
        d = this.place(d, [
          _,
          m + E,
          u
        ], N, n, c, h, Uh(b, S));
      }
      for (let p = d; p < this.pool.length; p += 1) this.pool[p].root.style.display = "none";
    }
    place(t, e, n, s, r, a, o) {
      if (t >= sc) return t;
      this.projected.set(e[0], e[1], e[2]);
      const l = this.projected.distanceTo(s.position);
      this.projected.setY(e[1] + W0 * l), this.projected.project(s);
      const c = this.node(t);
      if (this.projected.z > 1 || this.projected.x < -1.1 || this.projected.x > 1.1 || this.projected.y < -1.1 || this.projected.y > 1.1 || l > V0) return c.root.style.display = "none", t + 1;
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
  function Fh(i) {
    return Math.hypot(i[0], i[1], i[2]);
  }
  function Y0(i, t) {
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
  function q0(i, t, e) {
    const s = 1 / (1 + Fh([
      i[0] - t[0],
      i[1] - t[1],
      i[2] - t[2]
    ]) * 0.15);
    return Math.max(0, Math.min(e, e * s));
  }
  function j0(i, t, e) {
    if (!(e > 0)) return 0;
    const n = Fh([
      i[0] - t[0],
      i[1] - t[1],
      i[2] - t[2]
    ]), s = (e - n) / (e * 0.6);
    return Math.max(0, Math.min(1, s));
  }
  function K0(i, t, e) {
    const n = i + t * e, s = Math.PI * 2, r = n % s;
    return r < 0 ? r + s : r;
  }
  function Z0(i, t, e, n) {
    if (!(i > 0) || !(t > 0) || !(e > 0) || !(n > 0) || t >= 180) return 0;
    const s = t * Math.PI / 180 / 2;
    return n * i * Math.tan(s) / e;
  }
  function ir(i, t, e, n, s) {
    const r = Z0(t, e, n, s);
    return Math.max(Math.max(i, 0), r);
  }
  function Oh(i, t) {
    return !(i > 0) || !(t > 0) || t >= 180 ? 0 : i * Math.tan(t * Math.PI / 180 / 2);
  }
  function $0(i, t, e) {
    const n = Oh(t, e);
    return !(n > 0) || !(i > 0) ? 0 : i / n;
  }
  function Bh(i, t, e, n) {
    const s = Oh(t, e), r = Math.max(i, 0);
    return !(s > 0) || !(n > 0) ? r : Math.min(r, n * s);
  }
  function J0(i, t) {
    return i > 0 ? Math.min(1, t / i) : 1;
  }
  const Q0 = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, tv = `
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
`, kh = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, zh = `
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
`, sr = 32, zs = 48, rc = 48, ac = sr * l0, oc = sr, ev = 64, nv = new C(0, 1, 0), iv = 2.5, jr = 7, sv = 3, Kr = 6, rv = 9, av = 16, ov = 0.25, lv = 1.5, cv = 2.5, hv = 0.025, uv = 3e-3;
  class dv {
    group;
    planets;
    comets;
    asteroids;
    moons;
    rings;
    tails;
    tailMaterial;
    companions;
    companionCoronas = [];
    companionCoronaMaterials = [];
    companionCoronaGeometry;
    companionGroup;
    moonOrbitGroup;
    moonOrbitPool = [];
    moonOrbitGeometry;
    moonOrbitMaterial;
    dummy = new Se();
    color = new Et();
    spinAngles = /* @__PURE__ */ new Map();
    starPos = [
      0,
      0,
      0
    ];
    moonElapsed = 0;
    tailActivationDistance = 25;
    discMetallicity = ur;
    companionLight = null;
    camera = null;
    viewportHeightPx = 0;
    constructor() {
      this.group = new sn();
      const t = new Bs({
        color: 16777215,
        roughness: 0.85,
        metalness: 0.05
      });
      this.planets = new Xn(new gn(1, 24, 24), t, sr), this.planets.instanceMatrix.setUsage(Dn), this.planets.count = 0, this.planets.frustumCulled = false, this.group.add(this.planets);
      const e = new Ui({
        color: 4874354
      });
      this.comets = new Xn(new gn(1, 12, 12), e, zs), this.comets.instanceMatrix.setUsage(Dn), this.comets.count = 0, this.comets.frustumCulled = false, this.group.add(this.comets);
      const n = new Bs({
        color: 10130568,
        roughness: 1,
        metalness: 0
      });
      this.moons = new Xn(new gn(1, 12, 12), n, ac), this.moons.instanceMatrix.setUsage(Dn), this.moons.count = 0, this.moons.frustumCulled = false, this.group.add(this.moons);
      const s = new hr(lv, cv, 48, 1);
      s.rotateX(-Math.PI / 2);
      const r = new Bs({
        color: 16777215,
        emissive: 6971210,
        emissiveIntensity: 1,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.5,
        side: Ce,
        depthWrite: false
      });
      this.rings = new Xn(s, r, oc), this.rings.instanceMatrix.setUsage(Dn), this.rings.count = 0, this.rings.frustumCulled = false, this.group.add(this.rings);
      const a = new Bs({
        color: 9075302,
        roughness: 1,
        metalness: 0
      });
      this.asteroids = new Xn(new go(1, 0), a, rc), this.asteroids.instanceMatrix.setUsage(Dn), this.asteroids.count = 0, this.asteroids.frustumCulled = false, this.group.add(this.asteroids), this.moonOrbitGroup = new sn(), this.moonOrbitGroup.visible = false, this.group.add(this.moonOrbitGroup), this.moonOrbitGeometry = fv(ev), this.moonOrbitMaterial = new po({
        color: 10466520,
        transparent: true,
        opacity: 0.3,
        depthWrite: false
      });
      const o = new Mn(1, 1);
      o.translate(0, 0.5, 0), this.tailMaterial = new ae({
        uniforms: {
          uColor: {
            value: new Et(0.7, 0.85, 1)
          },
          uOpacity: {
            value: 0.9
          }
        },
        vertexShader: Q0,
        fragmentShader: tv,
        transparent: true,
        blending: Ve,
        depthWrite: false,
        side: Ce
      }), this.tails = new Xn(o, this.tailMaterial, zs), this.tails.instanceMatrix.setUsage(Dn), this.tails.count = 0, this.tails.frustumCulled = false, this.group.add(this.tails), this.companionGroup = new sn(), this.group.add(this.companionGroup);
      const l = new Ui({
        color: 16777215
      });
      this.companions = new Xn(new gn(1, 24, 24), l, Kr), this.companions.instanceMatrix.setUsage(Dn), this.companions.count = 0, this.companions.frustumCulled = false, this.companionGroup.add(this.companions), this.companionCoronaGeometry = new Mn(1, 1);
      for (let c = 0; c < Kr; c += 1) {
        const h = new ae({
          uniforms: {
            uColor: {
              value: new Et(1, 1, 1)
            },
            uIntensity: {
              value: 0
            }
          },
          vertexShader: kh,
          fragmentShader: zh,
          transparent: true,
          blending: Ve,
          depthWrite: false
        }), d = new he(this.companionCoronaGeometry, h);
        d.frustumCulled = false, d.visible = false, this.companionCoronaMaterials.push(h), this.companionCoronas.push(d), this.companionGroup.add(d);
      }
    }
    update(t, e, n, s, r) {
      this.camera = s ?? null, this.viewportHeightPx = r ?? 0;
      const a = Number.isFinite(n) && n > 0 ? Math.max(uv, Math.min(n, hv)) : 0;
      a > 0 && (this.moonElapsed += a);
      let o = 0, l = 0, c = 0, h = 0, d = 0, f = 0, p = 0, g = 0;
      const _ = /* @__PURE__ */ new Set();
      this.companionLight = null;
      for (let m = 0; m < e; m += 1) {
        const u = m * Nn, E = t[u + Bt.id] ?? 0, b = Math.round(t[u + Bt.type] ?? 0), S = t[u + Bt.radius] ?? 0.5, N = t[u + Bt.mass] ?? 0, w = [
          t[u + Bt.x] ?? 0,
          t[u + Bt.y] ?? 0,
          t[u + Bt.z] ?? 0
        ], A = t[u + Bt.spin] ?? 0;
        _.add(E);
        const P = K0(this.spinAngles.get(E) ?? 0, A, a);
        switch (this.spinAngles.set(E, P), b) {
          case kt.Comet:
            l = this.writeInstance(this.comets, l, w, S, P, zs), f = this.writeTail(f, w, S);
            break;
          case kt.Asteroid:
            c = this.writeInstance(this.asteroids, c, w, S, P, rc);
            break;
          case kt.Star:
          case kt.BrownDwarf:
            g = this.writeCompanion(g, w, N);
            break;
          case kt.Protoplanet:
          case kt.Planet:
          default: {
            if (ar(N)) {
              g = this.writeCompanion(g, w, N);
              break;
            }
            const y = c0(E, N, this.discMetallicity), x = this.drawnRadius(w, S, jr);
            o = this.writePlanet(o, w, x, P, y.axialTilt, y.color), y.hasRings && (d = this.writeRing(d, w, x, y.axialTilt, y.ringProminence));
            const R = this.writeMoons(h, p, E, y.moonCount, w, x);
            h = R.moonIndex, p = R.orbitIndex;
            break;
          }
        }
      }
      this.finalize(this.planets, o), this.finalize(this.comets, l), this.finalize(this.asteroids, c), this.finalize(this.moons, h), this.finalize(this.rings, d), this.finalize(this.tails, f), this.finalize(this.companions, g), this.planets.instanceColor !== null && (this.planets.instanceColor.needsUpdate = true), this.rings.instanceColor !== null && (this.rings.instanceColor.needsUpdate = true), this.companions.instanceColor !== null && (this.companions.instanceColor.needsUpdate = true);
      for (let m = g; m < this.companionCoronas.length; m += 1) this.companionCoronas[m].visible = false;
      for (let m = p; m < this.moonOrbitPool.length; m += 1) this.moonOrbitPool[m].visible = false;
      for (const m of this.spinAngles.keys()) _.has(m) || this.spinAngles.delete(m);
    }
    setMoonOrbitsVisible(t) {
      this.moonOrbitGroup.visible = t;
    }
    get luminousCompanion() {
      return this.companionLight;
    }
    writeCompanion(t, e, n) {
      if (t >= Kr) return t;
      const s = Ph(n), r = this.drawnRadius(e, s.radius, rv);
      return this.dummy.position.set(e[0], e[1], e[2]), this.dummy.rotation.set(0, 0, 0), this.dummy.scale.setScalar(r), this.dummy.updateMatrix(), this.companions.setMatrixAt(t, this.dummy.matrix), this.color.setRGB(s.color.r * s.surfaceLum, s.color.g * s.surfaceLum, s.color.b * s.surfaceLum), this.companions.setColorAt(t, this.color), this.writeCompanionCorona(t, e, s, r), s.star && (this.companionLight === null || n > this.companionLight.mass) && (this.companionLight = {
        position: [
          e[0],
          e[1],
          e[2]
        ],
        color: s.color,
        glow: s.glow,
        mass: n
      }), t + 1;
    }
    writeCompanionCorona(t, e, n, s) {
      const r = this.companionCoronas[t], a = this.companionCoronaMaterials[t];
      if (r === void 0 || a === void 0) return;
      const o = this.camera, l = wh(s, n.glow);
      let c = l, h = 1;
      if (o !== null && this.viewportHeightPx > 0) {
        const d = Math.hypot(e[0] - o.position.x, e[1] - o.position.y, e[2] - o.position.z), f = ir(l, d, o.fov, this.viewportHeightPx, av);
        c = Bh(f, d, o.fov, ov), h = c > 0 ? f / c : 1, r.quaternion.copy(o.quaternion);
      }
      r.position.set(e[0], e[1], e[2]), r.scale.setScalar(c * 2), r.visible = true, a.uniforms.uColor.value.setRGB(n.color.r, n.color.g, n.color.b), a.uniforms.uIntensity.value = Ah(n.glow, h);
    }
    drawnRadius(t, e, n) {
      const s = this.camera;
      if (s === null || this.viewportHeightPx <= 0) return Math.max(e, 0);
      const r = Math.hypot(t[0] - s.position.x, t[1] - s.position.y, t[2] - s.position.z);
      return ir(e, r, s.fov, this.viewportHeightPx, n);
    }
    writeInstance(t, e, n, s, r, a) {
      return e >= a ? e : (this.dummy.position.set(n[0], n[1], n[2]), this.dummy.rotation.set(0, r, 0), this.dummy.scale.setScalar(this.drawnRadius(n, s, jr)), this.dummy.updateMatrix(), t.setMatrixAt(e, this.dummy.matrix), e + 1);
    }
    writePlanet(t, e, n, s, r, a) {
      return t >= sr ? t : (this.dummy.position.set(e[0], e[1], e[2]), this.dummy.rotation.set(r, s, 0, "ZXY"), this.dummy.scale.setScalar(n), this.dummy.updateMatrix(), this.planets.setMatrixAt(t, this.dummy.matrix), this.color.setRGB(a.r, a.g, a.b), this.planets.setColorAt(t, this.color), t + 1);
    }
    writeRing(t, e, n, s, r) {
      if (t >= oc) return t;
      this.dummy.position.set(e[0], e[1], e[2]), this.dummy.rotation.set(s, 0, 0, "ZXY"), this.dummy.scale.setScalar(n), this.dummy.updateMatrix(), this.rings.setMatrixAt(t, this.dummy.matrix);
      const a = Math.max(0, Math.min(1, r));
      return this.color.setRGB(0.847 * a, 0.788 * a, 0.659 * a), this.rings.setColorAt(t, this.color), t + 1;
    }
    writeMoons(t, e, n, s, r, a) {
      let o = t, l = e;
      for (let c = 0; c < s && o < ac; c += 1) {
        const h = u0(n, c), d = d0(h, this.moonElapsed), f = a * h.radiusFactor, p = [
          r[0] + d[0] * a,
          r[1] + d[1] * a,
          r[2] + d[2] * a
        ], g = this.drawnRadius(p, a * h.sizeFactor, sv);
        if (this.dummy.position.set(p[0], p[1], p[2]), this.dummy.rotation.set(0, h.phase + this.moonElapsed * h.angularSpeed, 0), this.dummy.scale.setScalar(g), this.dummy.updateMatrix(), this.moons.setMatrixAt(o, this.dummy.matrix), o += 1, this.moonOrbitGroup.visible) {
          const _ = this.moonOrbitLine(l);
          _.position.set(r[0], r[1], r[2]), _.rotation.set(h.tilt, 0, 0, "ZXY"), _.scale.setScalar(f), _.visible = true, l += 1;
        }
      }
      return {
        moonIndex: o,
        orbitIndex: l
      };
    }
    moonOrbitLine(t) {
      const e = this.moonOrbitPool[t];
      if (e !== void 0) return e;
      const n = new $_(this.moonOrbitGeometry, this.moonOrbitMaterial);
      return n.frustumCulled = false, this.moonOrbitPool[t] = n, this.moonOrbitGroup.add(n), n;
    }
    setTailActivationDistance(t) {
      Number.isFinite(t) && t > 0 && (this.tailActivationDistance = t);
    }
    setDiscMetallicity(t) {
      Number.isFinite(t) && t >= 0 && (this.discMetallicity = t);
    }
    writeTail(t, e, n) {
      if (t >= zs) return t;
      const s = j0(e, this.starPos, this.tailActivationDistance);
      if (s <= 1e-3) return t;
      const r = Y0(e, this.starPos), a = s * q0(e, this.starPos, iv);
      if (a <= 1e-3) return t;
      this.dummy.position.set(e[0], e[1], e[2]), this.dummy.quaternion.setFromUnitVectors(nv, new C(r[0], r[1], r[2]));
      const o = this.drawnRadius(e, n, jr) * 4 * (0.5 + 0.5 * s);
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
        this.rings,
        this.tails,
        this.companions
      ]) {
        t.geometry.dispose();
        const e = t.material;
        Array.isArray(e) ? e.forEach((n) => n.dispose()) : e.dispose();
      }
      for (const t of this.moonOrbitPool) this.moonOrbitGroup.remove(t);
      this.moonOrbitPool.length = 0, this.moonOrbitGeometry.dispose(), this.moonOrbitMaterial.dispose();
      for (const t of this.companionCoronas) this.companionGroup.remove(t);
      for (const t of this.companionCoronaMaterials) t.dispose();
      this.companionCoronas.length = 0, this.companionCoronaMaterials.length = 0, this.companionCoronaGeometry.dispose(), this.companionLight = null, this.spinAngles.clear();
    }
  }
  function fv(i) {
    const t = new Float32Array(i * 3);
    for (let n = 0; n < i; n += 1) {
      const s = n / i * Math.PI * 2;
      t[n * 3] = Math.cos(s), t[n * 3 + 1] = 0, t[n * 3 + 2] = Math.sin(s);
    }
    const e = new Me();
    return e.setAttribute("position", new xe(t, 3)), e;
  }
  function lc(i, t) {
    return [
      i[1] * t[2] - i[2] * t[1],
      i[2] * t[0] - i[0] * t[2],
      i[0] * t[1] - i[1] * t[0]
    ];
  }
  function cc(i, t) {
    return i[0] * t[0] + i[1] * t[1] + i[2] * t[2];
  }
  function bi(i) {
    return Math.hypot(i[0], i[1], i[2]);
  }
  function pv(i, t) {
    return [
      i[0] * t,
      i[1] * t,
      i[2] * t
    ];
  }
  function Zr(i) {
    const t = bi(i);
    return t > 1e-12 ? pv(i, 1 / t) : null;
  }
  function mv(i, t, e) {
    const n = bi(i);
    if (!(n > 1e-9) || !(e > 0)) return null;
    const s = lc(i, t), r = bi(s);
    if (!(r > 1e-6 * n * bi(t))) return null;
    const a = cc(t, t), o = cc(i, t), l = [
      ((a - e / n) * i[0] - o * t[0]) / e,
      ((a - e / n) * i[1] - o * t[1]) / e,
      ((a - e / n) * i[2] - o * t[2]) / e
    ], c = bi(l), h = r * r / e, d = Zr(l) ?? Zr(i), f = Zr(s);
    if (d === null || f === null) return null;
    const p = lc(f, d);
    return {
      eccentricity: c,
      semiLatusRectum: h,
      periapsisDir: d,
      inPlaneDir: p,
      bound: c < 1
    };
  }
  function gv(i, t, e) {
    if (!(t > 1e-9) || !(e > 0)) return null;
    const n = (i / e - 1) / t;
    return !(n >= -1) || !(n <= 1) ? null : Math.acos(n);
  }
  function _v(i, t, e, n = {}) {
    const s = mv(i, t, e);
    if (s === null) return new Float32Array(0);
    const r = Math.max(8, Math.floor(n.segments ?? 128)), a = n.maxRadius ?? 4e3, { eccentricity: o, semiLatusRectum: l, periapsisDir: c, inPlaneDir: h } = s, d = l / (1 + o);
    if (!(d > 1e-3 * bi(i))) return new Float32Array(0);
    if (!(d < a)) return new Float32Array(0);
    const f = gv(l, o, a);
    let p, g;
    if (s.bound) f === null ? (p = 0, g = Math.PI * 2) : (p = -f, g = f);
    else {
      const u = Math.min(Math.max(n.hyperbolicSpan ?? 0.999, 0.05), 0.9999), E = Math.acos(Math.max(-1, -1 / Math.max(o, 1.0000001))) * u;
      g = f === null ? E : Math.min(E, f), p = -g;
    }
    const _ = r + 1, m = new Float32Array(_ * 3);
    for (let u = 0; u < _; u += 1) {
      const E = p + (g - p) * u / r, b = 1 + o * Math.cos(E), S = b > 1e-9 ? Math.min(l / b, a) : a, N = Math.cos(E) * S, w = Math.sin(E) * S;
      m[u * 3] = c[0] * N + h[0] * w, m[u * 3 + 1] = c[1] * N + h[1] * w, m[u * 3 + 2] = c[2] * N + h[2] * w;
    }
    return m;
  }
  const vv = 64, hc = 160, xv = 0.999, $r = {
    [kt.Protoplanet]: 7309e3,
    [kt.Planet]: 9414888,
    [kt.Comet]: 7330024,
    [kt.Asteroid]: 12165508,
    [kt.BrownDwarf]: 13208170,
    [kt.Star]: 15917752
  };
  class Mv {
    group;
    pool = [];
    enabled = false;
    maxRadius = Ic;
    constructor() {
      this.group = new sn(), this.group.visible = false;
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
      for (let r = 0; r < e && s < vv; r += 1) {
        const a = r * Nn, o = [
          t[a + Bt.x] ?? 0,
          t[a + Bt.y] ?? 0,
          t[a + Bt.z] ?? 0
        ], l = [
          t[a + Bt.vx] ?? 0,
          t[a + Bt.vy] ?? 0,
          t[a + Bt.vz] ?? 0
        ], c = _v(o, l, n, {
          segments: hc,
          hyperbolicSpan: xv,
          maxRadius: this.maxRadius
        });
        if (c.length === 0) continue;
        const h = Math.round(t[a + Bt.type] ?? 0);
        this.writeOrbit(s, c, $r[h] ?? $r[kt.Planet]), s += 1;
      }
      for (let r = s; r < this.pool.length; r += 1) this.pool[r].line.visible = false;
    }
    writeOrbit(t, e, n) {
      const s = this.line(t), r = Math.min(e.length, s.positions.length);
      s.positions.set(e.subarray(0, r));
      const a = s.geometry.getAttribute("position");
      a.needsUpdate = true, s.geometry.setDrawRange(0, Math.floor(r / 3)), s.material.color.setHex(n), s.line.visible = true;
    }
    line(t) {
      const e = this.pool[t];
      if (e !== void 0) return e;
      const n = new Float32Array((hc + 1) * 3), s = new Me(), r = new xe(n, 3);
      r.setUsage(Dn), s.setAttribute("position", r);
      const a = new po({
        color: $r[kt.Planet],
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      }), o = new gh(s, a);
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
  const uc = {
    type: "change"
  }, To = {
    type: "start"
  }, Hh = {
    type: "end"
  }, Hs = new ls(), dc = new Ln(), Sv = Math.cos(70 * Qc.DEG2RAD), pe = new C(), De = 2 * Math.PI, Jt = {
    NONE: -1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
  }, Jr = 1e-6;
  class yv extends s0 {
    constructor(t, e = null) {
      super(t, e), this.state = Jt.NONE, this.enabled = true, this.target = new C(), this.cursor = new C(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = false, this.dampingFactor = 0.05, this.enableZoom = true, this.zoomSpeed = 1, this.enableRotate = true, this.rotateSpeed = 1, this.enablePan = true, this.panSpeed = 1, this.screenSpacePanning = true, this.keyPanSpeed = 7, this.zoomToCursor = false, this.autoRotate = false, this.autoRotateSpeed = 2, this.keys = {
        LEFT: "ArrowLeft",
        UP: "ArrowUp",
        RIGHT: "ArrowRight",
        BOTTOM: "ArrowDown"
      }, this.mouseButtons = {
        LEFT: Ti.ROTATE,
        MIDDLE: Ti.DOLLY,
        RIGHT: Ti.PAN
      }, this.touches = {
        ONE: yi.ROTATE,
        TWO: yi.DOLLY_PAN
      }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new C(), this._lastQuaternion = new Qn(), this._lastTargetPosition = new C(), this._quat = new Qn().setFromUnitVectors(t.up, new C(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new ec(), this._sphericalDelta = new ec(), this._scale = 1, this._panOffset = new C(), this._rotateStart = new _t(), this._rotateEnd = new _t(), this._rotateDelta = new _t(), this._panStart = new _t(), this._panEnd = new _t(), this._panDelta = new _t(), this._dollyStart = new _t(), this._dollyEnd = new _t(), this._dollyDelta = new _t(), this._dollyDirection = new C(), this._mouse = new _t(), this._performCursorZoom = false, this._pointers = [], this._pointerPositions = {}, this._controlActive = false, this._onPointerMove = bv.bind(this), this._onPointerDown = Ev.bind(this), this._onPointerUp = Tv.bind(this), this._onContextMenu = Lv.bind(this), this._onMouseWheel = Cv.bind(this), this._onKeyDown = Rv.bind(this), this._onTouchStart = Pv.bind(this), this._onTouchMove = Dv.bind(this), this._onMouseDown = wv.bind(this), this._onMouseMove = Av.bind(this), this._interceptControlDown = Iv.bind(this), this._interceptControlUp = Uv.bind(this), this.domElement !== null && this.connect(), this.update();
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
      this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(uc), this.update(), this.state = Jt.NONE;
    }
    update(t = null) {
      const e = this.object.position;
      pe.copy(e).sub(this.target), pe.applyQuaternion(this._quat), this._spherical.setFromVector3(pe), this.autoRotate && this.state === Jt.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
      let n = this.minAzimuthAngle, s = this.maxAzimuthAngle;
      isFinite(n) && isFinite(s) && (n < -Math.PI ? n += De : n > Math.PI && (n -= De), s < -Math.PI ? s += De : s > Math.PI && (s -= De), n <= s ? this._spherical.theta = Math.max(n, Math.min(s, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + s) / 2 ? Math.max(n, this._spherical.theta) : Math.min(s, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === true ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
      let r = false;
      if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
      else {
        const a = this._spherical.radius;
        this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), r = a != this._spherical.radius;
      }
      if (pe.setFromSpherical(this._spherical), pe.applyQuaternion(this._quatInverse), e.copy(this.target).add(pe), this.object.lookAt(this.target), this.enableDamping === true ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
        let a = null;
        if (this.object.isPerspectiveCamera) {
          const o = pe.length();
          a = this._clampDistance(o * this._scale);
          const l = o - a;
          this.object.position.addScaledVector(this._dollyDirection, l), this.object.updateMatrixWorld(), r = !!l;
        } else if (this.object.isOrthographicCamera) {
          const o = new C(this._mouse.x, this._mouse.y, 0);
          o.unproject(this.object);
          const l = this.object.zoom;
          this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), r = l !== this.object.zoom;
          const c = new C(this._mouse.x, this._mouse.y, 0);
          c.unproject(this.object), this.object.position.sub(c).add(o), this.object.updateMatrixWorld(), a = pe.length();
        } else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = false;
        a !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position) : (Hs.origin.copy(this.object.position), Hs.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(Hs.direction)) < Sv ? this.object.lookAt(this.target) : (dc.setFromNormalAndCoplanarPoint(this.object.up, this.target), Hs.intersectPlane(dc, this.target))));
      } else if (this.object.isOrthographicCamera) {
        const a = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), a !== this.object.zoom && (this.object.updateProjectionMatrix(), r = true);
      }
      return this._scale = 1, this._performCursorZoom = false, r || this._lastPosition.distanceToSquared(this.object.position) > Jr || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > Jr || this._lastTargetPosition.distanceToSquared(this.target) > Jr ? (this.dispatchEvent(uc), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), true) : false;
    }
    _getAutoRotationAngle(t) {
      return t !== null ? De / 60 * this.autoRotateSpeed * t : De / 60 / 60 * this.autoRotateSpeed;
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
      pe.setFromMatrixColumn(e, 0), pe.multiplyScalar(-t), this._panOffset.add(pe);
    }
    _panUp(t, e) {
      this.screenSpacePanning === true ? pe.setFromMatrixColumn(e, 1) : (pe.setFromMatrixColumn(e, 0), pe.crossVectors(this.object.up, pe)), pe.multiplyScalar(t), this._panOffset.add(pe);
    }
    _pan(t, e) {
      const n = this.domElement;
      if (this.object.isPerspectiveCamera) {
        const s = this.object.position;
        pe.copy(s).sub(this.target);
        let r = pe.length();
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
      this._rotateLeft(De * this._rotateDelta.x / e.clientHeight), this._rotateUp(De * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateUp(De * this.rotateSpeed / this.domElement.clientHeight) : this._pan(0, this.keyPanSpeed), e = true;
          break;
        case this.keys.BOTTOM:
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateUp(-De * this.rotateSpeed / this.domElement.clientHeight) : this._pan(0, -this.keyPanSpeed), e = true;
          break;
        case this.keys.LEFT:
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateLeft(De * this.rotateSpeed / this.domElement.clientHeight) : this._pan(this.keyPanSpeed, 0), e = true;
          break;
        case this.keys.RIGHT:
          t.ctrlKey || t.metaKey || t.shiftKey ? this._rotateLeft(-De * this.rotateSpeed / this.domElement.clientHeight) : this._pan(-this.keyPanSpeed, 0), e = true;
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
      this._rotateLeft(De * this._rotateDelta.x / e.clientHeight), this._rotateUp(De * this._rotateDelta.y / e.clientHeight), this._rotateStart.copy(this._rotateEnd);
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
  function Ev(i) {
    this.enabled !== false && (this._pointers.length === 0 && (this.domElement.setPointerCapture(i.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(i) && (this._addPointer(i), i.pointerType === "touch" ? this._onTouchStart(i) : this._onMouseDown(i)));
  }
  function bv(i) {
    this.enabled !== false && (i.pointerType === "touch" ? this._onTouchMove(i) : this._onMouseMove(i));
  }
  function Tv(i) {
    switch (this._removePointer(i), this._pointers.length) {
      case 0:
        this.domElement.releasePointerCapture(i.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(Hh), this.state = Jt.NONE;
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
  function wv(i) {
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
      case Ti.DOLLY:
        if (this.enableZoom === false) return;
        this._handleMouseDownDolly(i), this.state = Jt.DOLLY;
        break;
      case Ti.ROTATE:
        if (i.ctrlKey || i.metaKey || i.shiftKey) {
          if (this.enablePan === false) return;
          this._handleMouseDownPan(i), this.state = Jt.PAN;
        } else {
          if (this.enableRotate === false) return;
          this._handleMouseDownRotate(i), this.state = Jt.ROTATE;
        }
        break;
      case Ti.PAN:
        if (i.ctrlKey || i.metaKey || i.shiftKey) {
          if (this.enableRotate === false) return;
          this._handleMouseDownRotate(i), this.state = Jt.ROTATE;
        } else {
          if (this.enablePan === false) return;
          this._handleMouseDownPan(i), this.state = Jt.PAN;
        }
        break;
      default:
        this.state = Jt.NONE;
    }
    this.state !== Jt.NONE && this.dispatchEvent(To);
  }
  function Av(i) {
    switch (this.state) {
      case Jt.ROTATE:
        if (this.enableRotate === false) return;
        this._handleMouseMoveRotate(i);
        break;
      case Jt.DOLLY:
        if (this.enableZoom === false) return;
        this._handleMouseMoveDolly(i);
        break;
      case Jt.PAN:
        if (this.enablePan === false) return;
        this._handleMouseMovePan(i);
        break;
    }
  }
  function Cv(i) {
    this.enabled === false || this.enableZoom === false || this.state !== Jt.NONE || (i.preventDefault(), this.dispatchEvent(To), this._handleMouseWheel(this._customWheelEvent(i)), this.dispatchEvent(Hh));
  }
  function Rv(i) {
    this.enabled === false || this.enablePan === false || this._handleKeyDown(i);
  }
  function Pv(i) {
    switch (this._trackPointer(i), this._pointers.length) {
      case 1:
        switch (this.touches.ONE) {
          case yi.ROTATE:
            if (this.enableRotate === false) return;
            this._handleTouchStartRotate(i), this.state = Jt.TOUCH_ROTATE;
            break;
          case yi.PAN:
            if (this.enablePan === false) return;
            this._handleTouchStartPan(i), this.state = Jt.TOUCH_PAN;
            break;
          default:
            this.state = Jt.NONE;
        }
        break;
      case 2:
        switch (this.touches.TWO) {
          case yi.DOLLY_PAN:
            if (this.enableZoom === false && this.enablePan === false) return;
            this._handleTouchStartDollyPan(i), this.state = Jt.TOUCH_DOLLY_PAN;
            break;
          case yi.DOLLY_ROTATE:
            if (this.enableZoom === false && this.enableRotate === false) return;
            this._handleTouchStartDollyRotate(i), this.state = Jt.TOUCH_DOLLY_ROTATE;
            break;
          default:
            this.state = Jt.NONE;
        }
        break;
      default:
        this.state = Jt.NONE;
    }
    this.state !== Jt.NONE && this.dispatchEvent(To);
  }
  function Dv(i) {
    switch (this._trackPointer(i), this.state) {
      case Jt.TOUCH_ROTATE:
        if (this.enableRotate === false) return;
        this._handleTouchMoveRotate(i), this.update();
        break;
      case Jt.TOUCH_PAN:
        if (this.enablePan === false) return;
        this._handleTouchMovePan(i), this.update();
        break;
      case Jt.TOUCH_DOLLY_PAN:
        if (this.enableZoom === false && this.enablePan === false) return;
        this._handleTouchMoveDollyPan(i), this.update();
        break;
      case Jt.TOUCH_DOLLY_ROTATE:
        if (this.enableZoom === false && this.enableRotate === false) return;
        this._handleTouchMoveDollyRotate(i), this.update();
        break;
      default:
        this.state = Jt.NONE;
    }
  }
  function Lv(i) {
    this.enabled !== false && i.preventDefault();
  }
  function Iv(i) {
    i.key === "Control" && (this._controlActive = true, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
      passive: true,
      capture: true
    }));
  }
  function Uv(i) {
    i.key === "Control" && (this._controlActive = false, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
      passive: true,
      capture: true
    }));
  }
  const Nv = 4;
  class Fv {
    camera;
    controls;
    followProvider = null;
    lastFollowPos = null;
    smoothedTarget = [
      0,
      0,
      0
    ];
    keepOutRadius = 0;
    constructor(t, e) {
      this.camera = t, this.controls = new yv(t, e), this.controls.enableDamping = true, this.controls.dampingFactor = 0.08, this.controls.minDistance = 5e-4, this.controls.maxDistance = Lc;
    }
    focusOn(t, e, n = null) {
      this.followProvider = n, this.lastFollowPos = [
        t[0],
        t[1],
        t[2]
      ];
      const s = Lu(e, this.camera.fov, 2.2), r = new C().subVectors(this.camera.position, this.controls.target).normalize();
      r.lengthSq() < 1e-8 && r.set(0, 0.4, 1).normalize(), this.controls.target.set(t[0], t[1], t[2]), this.smoothedTarget[0] = t[0], this.smoothedTarget[1] = t[1], this.smoothedTarget[2] = t[2], this.camera.position.copy(this.controls.target).addScaledVector(r, s);
    }
    setKeepOutRadius(t) {
      this.keepOutRadius = Number.isFinite(t) && t > 0 ? t : 0;
    }
    setFollow(t) {
      this.followProvider = t, this.lastFollowPos = null;
    }
    clearFollow() {
      this.followProvider = null, this.lastFollowPos = null;
    }
    zoomIn(t = 0.8) {
      this.dolly(t);
    }
    zoomOut(t = 1.25) {
      this.dolly(t);
    }
    dolly(t) {
      const e = new C().subVectors(this.camera.position, this.controls.target), n = Qc.clamp(e.length() * t, this.controls.minDistance, this.controls.maxDistance);
      e.setLength(n), this.camera.position.copy(this.controls.target).add(e);
    }
    update(t) {
      const e = this.followProvider;
      if (e !== null) {
        const n = e();
        if (n !== null) {
          const s = this.lastFollowPos ?? [
            n[0],
            n[1],
            n[2]
          ], r = [
            this.controls.target.x,
            this.controls.target.y,
            this.controls.target.z
          ], a = Ou(r, n, s, Nv, t), o = new C(a[0] - r[0], a[1] - r[1], a[2] - r[2]);
          this.controls.target.set(a[0], a[1], a[2]), this.camera.position.add(o), this.smoothedTarget[0] = a[0], this.smoothedTarget[1] = a[1], this.smoothedTarget[2] = a[2], this.lastFollowPos = [
            n[0],
            n[1],
            n[2]
          ];
        }
      }
      this.controls.update(), this.applyKeepOut(), this.syncNearPlane();
    }
    applyKeepOut() {
      if (this.keepOutRadius <= 0) return;
      const t = Fu([
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z
      ], [
        0,
        0,
        0
      ], this.keepOutRadius);
      this.camera.position.set(t[0], t[1], t[2]);
    }
    syncNearPlane() {
      const t = this.camera.position.distanceTo(this.controls.target), e = Uu(t);
      this.camera.near !== e && (this.camera.near = e, this.camera.updateProjectionMatrix());
    }
    dispose() {
      this.controls.dispose();
    }
  }
  const Ov = `
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
`, Bv = `
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
  class kv {
    points;
    geometry;
    material;
    positions;
    colors;
    sizes;
    capacity;
    constructor(t, e = 1) {
      this.capacity = Math.max(1, Math.floor(t)), this.positions = new Float32Array(this.capacity * 3), this.colors = new Float32Array(this.capacity * 3), this.sizes = new Float32Array(this.capacity), this.geometry = new Me(), this.geometry.setAttribute("position", new xe(this.positions, 3)), this.geometry.setAttribute("aColor", new xe(this.colors, 3)), this.geometry.setAttribute("aSize", new xe(this.sizes, 1)), this.geometry.setDrawRange(0, 0), this.material = new ae({
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
        vertexShader: Ov,
        fragmentShader: Bv,
        transparent: true,
        blending: Ve,
        depthWrite: false
      }), this.points = new vh(this.geometry, this.material), this.points.frustumCulled = false;
    }
    update(t, e) {
      const n = Math.min(e, this.capacity);
      for (let o = 0; o < n; o += 1) {
        const l = o * Qa, c = o * 3;
        this.positions[c] = t[l + Bn.x] ?? 0, this.positions[c + 1] = t[l + Bn.y] ?? 0, this.positions[c + 2] = t[l + Bn.z] ?? 0, this.colors[c] = t[l + Bn.r] ?? 1, this.colors[c + 1] = t[l + Bn.g] ?? 1, this.colors[c + 2] = t[l + Bn.b] ?? 1, this.sizes[o] = t[l + Bn.size] ?? 1;
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
  const zv = `
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
`, Hv = `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorCore;   // blackbody color of the surface
  uniform vec3 uColorEdge;   // slightly cooler limb color
  uniform float uGlow;       // corona intensity multiplier
  uniform float uDetail;     // 0 = smooth degenerate crust, 1 = full granulation

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
    // A convective photosphere boils; a neutron star's degenerate crust does
    // not. uDetail blends between the two so a compact remnant renders as a
    // smooth, searing sphere rather than a few pixels of noise.
    float granulation = mix(0.5, fbm(p + uTime * 0.05), uDetail);
    float hotSpots = pow(granulation, 2.0);

    // Fresnel term brightens the limb into a corona rim.
    float fresnel = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.5);

    // Granulation modulates BRIGHTNESS ONLY. Blending between two differently
    // tinted colours (the old mix(edge, core, hotSpots)) dragged every hue
    // toward the average and, after the ACES tone-map and bloom, left a hot
    // O-star looking like the same pale ball as a G-star. Keeping the hue fixed
    // and varying only the intensity is both truer and far more legible.
    float bright = 0.72 + 0.52 * granulation + 0.18 * hotSpots;

    // Limb darkening: the edge of the disc looks through more atmosphere, so it
    // is dimmer and marginally cooler \u2014 a small shift, not a change of colour.
    float limb = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 1.2);
    vec3 surface = mix(uColorCore, uColorEdge, limb * 0.65) * bright;

    // Tinted rim glow, bounded so the limb flares without washing the disc out.
    vec3 color = surface + uColorCore * fresnel * (0.25 + 0.2 * uGlow);

    gl_FragColor = vec4(color, 1.0);
  }
`, Gv = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, Vv = `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    float along = clamp(vUv.y, 0.0, 1.0);
    // Lateral distance from the beam axis, 0 on the axis and 1 at the quad edge.
    float lateral = abs(vUv.x - 0.5) * 2.0;

    // The cone opens up with distance, from a tight throat at the magnetic pole.
    float halfWidth = mix(0.07, 1.0, pow(along, 0.75));
    float across = 1.0 - smoothstep(halfWidth * 0.15, halfWidth, lateral);

    // Radiation is brightest at the poles and fades to nothing at the tip.
    float falloff = pow(1.0 - along, 2.0);
    // A slow travelling ripple so the beam breathes instead of sitting static.
    float pulse = 0.82 + 0.18 * sin(along * 9.0 - uTime * 3.0);

    float a = across * falloff * pulse;
    if (a < 0.003) discard;
    // A brighter core along the axis reads as the collimated part of the beam.
    float core = pow(1.0 - lateral, 6.0) * falloff;
    gl_FragColor = vec4(uColor * uIntensity * (a + core * 0.8), a * 0.75);
  }
`, Wv = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, Xv = `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    // uv.x runs around the ring, uv.y around the tube cross-section.
    float tube = sin(vUv.y * 6.2831853);
    float rim = 1.0 - abs(tube);              // brightest on the tube's spine
    float wave = 0.55 + 0.45 * sin(vUv.x * 12.566 - uTime * 4.0);
    float a = pow(rim, 1.5) * wave;
    gl_FragColor = vec4(uColor * uIntensity * a, a * 0.8);
  }
`, Yv = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, qv = `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;

  varying vec2 vUv;

  void main() {
    // Distance from the quad's centre, in units of its half-width.
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    // A thin, very bright ring with soft shoulders on both sides.
    float ring = exp(-pow((r - 0.62) / 0.055, 2.0));
    // A faint outer glow so the ring is not a hairline at small scales.
    float halo = exp(-pow((r - 0.62) / 0.34, 2.0)) * 0.22;
    float a = clamp(ring + halo, 0.0, 1.0);
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * uIntensity * (ring * 1.6 + halo), a);
  }
`, jv = `
  varying vec2 vUv;
  varying vec3 vLocal;
  void main() {
    vUv = uv;
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`, Kv = `
  precision highp float;

  uniform vec3 uInnerColor;
  uniform vec3 uOuterColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;

  varying vec3 vLocal;

  void main() {
    float r = length(vLocal.xy);
    float t = clamp((r - uInnerRadius) / max(uOuterRadius - uInnerRadius, 1e-4), 0.0, 1.0);

    // A LOGARITHMIC spiral that rotates rigidly. Winding the arms up with a
    // radius-dependent angular speed (the naive Keplerian shear) makes the
    // pattern's radial frequency grow without bound, and within seconds the disc
    // aliases into a stack of concentric rings instead of arms.
    float angle = atan(vLocal.y, vLocal.x);
    float spiral = angle * 2.0 - log(max(r / uInnerRadius, 1.0001)) * 5.0 + uTime * 1.6;
    float banding = 0.78 + 0.22 * sin(spiral);

    // Temperature falls outward (T \u221D r^-3/4), so colour and brightness do too.
    vec3 color = mix(uInnerColor, uOuterColor, pow(t, 0.55));
    float radial = pow(1.0 - t, 2.0);
    // Soft inner cut so the disc does not end in a hard circle at the horizon.
    float innerFade = smoothstep(0.0, 0.1, t);

    float a = radial * innerFade * banding;
    if (a < 0.004) discard;
    gl_FragColor = vec4(color * uIntensity * a, a);
  }
`, Zv = `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  void main() {
    vLocal = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`, $v = `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  // Cheap hash noise, reused for the shell's filamentary structure.
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

  void main() {
    // Grazing incidence \u21D2 a long path through the shell \u21D2 bright limb.
    float facing = abs(dot(normalize(vNormalW), normalize(vViewDir)));
    float limb = pow(1.0 - facing, 3.5);

    // Rayleigh-Taylor filaments: a real shell is ragged, never a smooth bubble.
    vec3 dir = normalize(vLocal);
    float filaments = 0.55 + 0.75 * noise(dir * 7.0 + uTime * 0.06);
    filaments *= 0.7 + 0.5 * noise(dir * 17.0);

    float a = limb * filaments * uIntensity;
    if (a < 0.003) discard;
    // A hotter, whiter rim on top of the shell's own colour.
    vec3 color = uColor + vec3(0.35, 0.3, 0.25) * pow(limb, 2.0);
    gl_FragColor = vec4(color * a, a);
  }
`, Jv = 3, Qv = 1.7, tx = Math.PI / 5, fc = 2.6, pc = 9, ex = 4.2, nx = 7, ix = 20, sx = 0.55, rx = 1.1, ax = 16;
  class ox {
    group;
    starMesh;
    starMaterial;
    corona;
    coronaMaterial;
    beams;
    beamMaterial;
    magnetosphere;
    magnetosphereMaterial;
    blackHole;
    horizon;
    horizonMaterial;
    photonRing;
    photonRingMaterial;
    accretionDisc;
    accretionDiscMaterial;
    blastShell;
    blastShellMaterial;
    elapsed = 0;
    beamAngle = 0;
    magnetosphereAngle = 0;
    axis = new C();
    viewDir = new C();
    right = new C();
    forward = new C();
    basis = new qt();
    scaleMatrix = new qt();
    constructor() {
      this.group = new sn(), this.starMaterial = new ae({
        uniforms: {
          uTime: {
            value: 0
          },
          uColorCore: {
            value: new Et(1, 1, 1)
          },
          uColorEdge: {
            value: new Et(1, 0.6, 0.3)
          },
          uGlow: {
            value: 1
          },
          uDetail: {
            value: 1
          }
        },
        vertexShader: zv,
        fragmentShader: Hv
      }), this.starMesh = new he(new gn(1, 48, 48), this.starMaterial), this.group.add(this.starMesh), this.coronaMaterial = new ae({
        uniforms: {
          uColor: {
            value: new Et(1, 1, 1)
          },
          uIntensity: {
            value: 1
          }
        },
        vertexShader: kh,
        fragmentShader: zh,
        transparent: true,
        blending: Ve,
        depthWrite: false
      }), this.corona = new he(new Mn(1, 1), this.coronaMaterial), this.corona.frustumCulled = false, this.group.add(this.corona), this.beamMaterial = new ae({
        uniforms: {
          uColor: {
            value: new Et(0.65, 0.85, 1)
          },
          uIntensity: {
            value: 1.6
          },
          uTime: {
            value: 0
          }
        },
        vertexShader: Gv,
        fragmentShader: Vv,
        transparent: true,
        blending: Ve,
        depthWrite: false,
        side: Ce
      });
      const t = new Mn(1, 1);
      t.translate(0, 0.5, 0), this.beams = [
        new he(t, this.beamMaterial),
        new he(t, this.beamMaterial)
      ];
      for (const e of this.beams) e.visible = false, e.frustumCulled = false, e.matrixAutoUpdate = false, this.group.add(e);
      this.magnetosphereMaterial = new ae({
        uniforms: {
          uColor: {
            value: new Et(0.55, 0.8, 1)
          },
          uIntensity: {
            value: 2.2
          },
          uTime: {
            value: 0
          }
        },
        vertexShader: Wv,
        fragmentShader: Xv,
        transparent: true,
        blending: Ve,
        depthWrite: false,
        side: Ce
      }), this.magnetosphere = new he(new _o(1, 0.06, 10, 96), this.magnetosphereMaterial), this.magnetosphere.rotation.x = Math.PI / 2, this.magnetosphere.visible = false, this.magnetosphere.frustumCulled = false, this.group.add(this.magnetosphere), this.blackHole = new sn(), this.horizonMaterial = new Ui({
        color: 0
      }), this.horizon = new he(new gn(1, 32, 32), this.horizonMaterial), this.blackHole.add(this.horizon), this.photonRingMaterial = new ae({
        uniforms: {
          uColor: {
            value: new Et(1, 0.93, 0.78)
          },
          uIntensity: {
            value: 2.6
          }
        },
        vertexShader: Yv,
        fragmentShader: qv,
        transparent: true,
        blending: Ve,
        depthWrite: false
      }), this.photonRing = new he(new Mn(1, 1), this.photonRingMaterial), this.photonRing.frustumCulled = false, this.blackHole.add(this.photonRing), this.accretionDiscMaterial = new ae({
        uniforms: {
          uInnerColor: {
            value: new Et(0.85, 0.93, 1)
          },
          uOuterColor: {
            value: new Et(1, 0.42, 0.12)
          },
          uIntensity: {
            value: 2.2
          },
          uTime: {
            value: 0
          },
          uInnerRadius: {
            value: fc
          },
          uOuterRadius: {
            value: pc
          }
        },
        vertexShader: jv,
        fragmentShader: Kv,
        transparent: true,
        blending: Ve,
        depthWrite: false,
        side: Ce
      }), this.accretionDisc = new he(new hr(fc, pc, 128, 12), this.accretionDiscMaterial), this.accretionDisc.rotation.x = -Math.PI / 2 + 0.42, this.accretionDisc.frustumCulled = false, this.blackHole.add(this.accretionDisc), this.blackHole.visible = false, this.group.add(this.blackHole), this.blastShellMaterial = new ae({
        uniforms: {
          uColor: {
            value: new Et(1, 0.8, 0.6)
          },
          uIntensity: {
            value: 0
          },
          uTime: {
            value: 0
          }
        },
        vertexShader: Zv,
        fragmentShader: $v,
        transparent: true,
        blending: Ve,
        depthWrite: false,
        side: Ce
      }), this.blastShell = new he(new gn(1, 64, 48), this.blastShellMaterial), this.blastShell.visible = false, this.blastShell.frustumCulled = false, this.group.add(this.blastShell);
    }
    update(t, e, n, s = 0) {
      if (this.elapsed += e, this.group.visible = t.visible, !t.visible) return;
      const r = n.position.length(), a = n instanceof Ie ? n : null, l = t.blackHole || t.magnetosphere ? ax : nx, c = a === null || s <= 0 ? t.radius : ir(t.radius, r, a.fov, s, l);
      if (this.starMesh.visible = !t.blackHole, this.corona.visible = !t.blackHole, !t.blackHole) {
        this.starMesh.scale.setScalar(c), this.starMaterial.uniforms.uTime.value = this.elapsed, this.starMaterial.uniforms.uDetail.value = t.surfaceDetail;
        const h = t.surfaceLum;
        this.starMaterial.uniforms.uColorCore.value.setRGB(t.color.r * h, t.color.g * h, t.color.b * h), this.starMaterial.uniforms.uColorEdge.value.setRGB(t.color.r * 0.68 * h, t.color.g * 0.6 * h, t.color.b * 0.54 * h), this.starMaterial.uniforms.uGlow.value = t.glow;
        const p = wh(t.radius, t.glow);
        let g = p, _ = 1;
        if (a !== null && s > 0) {
          const m = ir(p, r, a.fov, s, ix);
          g = Bh(m, r, a.fov, sx), _ = g > 0 ? m / g : 1;
        }
        this.corona.scale.setScalar(g * 2), this.corona.quaternion.copy(n.quaternion), this.coronaMaterial.uniforms.uColor.value.setRGB(t.color.r, t.color.g, t.color.b), this.coronaMaterial.uniforms.uIntensity.value = Ah(t.glow, _);
      }
      this.updateBlastShell(t, r, a), this.updateMagnetosphere(t, e, c), this.updateBeams(t, e, c, n), this.updateBlackHole(t, c, n);
    }
    updateBlastShell(t, e, n) {
      const s = t.shockwave > 1e-3 && t.shockwaveRadius > 0;
      if (this.blastShell.visible = s, !s) return;
      this.blastShell.scale.setScalar(t.shockwaveRadius);
      const r = n === null ? 1 : J0($0(t.shockwaveRadius, e, n.fov), rx);
      this.blastShellMaterial.uniforms.uIntensity.value = t.shockwave * r, this.blastShellMaterial.uniforms.uTime.value = this.elapsed, this.blastShellMaterial.uniforms.uColor.value.setRGB(t.shockwaveColor.r, t.shockwaveColor.g, t.shockwaveColor.b);
    }
    updateMagnetosphere(t, e, n) {
      this.magnetosphere.visible = t.magnetosphere, t.magnetosphere && (this.magnetosphereAngle += Qv * e, this.magnetosphere.rotation.z = this.magnetosphereAngle, this.magnetosphere.scale.setScalar(n * 3.1), this.magnetosphereMaterial.uniforms.uTime.value = this.elapsed, this.magnetosphereMaterial.uniforms.uColor.value.setRGB(t.color.r, t.color.g, t.color.b));
    }
    updateBeams(t, e, n, s) {
      for (const c of this.beams) c.visible = t.pulsarBeam;
      if (!t.pulsarBeam) return;
      this.beamAngle += Jv * e, this.beamMaterial.uniforms.uTime.value = this.elapsed;
      const r = tx, a = this.beamAngle;
      this.axis.set(-Math.sin(r) * Math.cos(a), Math.cos(r), Math.sin(r) * Math.sin(a)).normalize(), this.viewDir.copy(s.position).normalize(), this.right.copy(this.axis).cross(this.viewDir), this.right.lengthSq() < 1e-8 && this.right.set(1, 0, 0).cross(this.axis), this.right.normalize();
      const o = n * 14, l = n * 7;
      for (let c = 0; c < this.beams.length; c += 1) {
        const h = this.beams[c], d = c === 0 ? 1 : -1;
        this.forward.copy(this.right).cross(this.axis).multiplyScalar(d), this.basis.makeBasis(this.right, this.axis.clone().multiplyScalar(d), this.forward), this.scaleMatrix.makeScale(l, o, 1), h.matrix.multiplyMatrices(this.basis, this.scaleMatrix), h.matrixWorldNeedsUpdate = true;
      }
    }
    updateBlackHole(t, e, n) {
      this.blackHole.visible = t.blackHole, t.blackHole && (this.horizon.scale.setScalar(e), this.photonRing.scale.setScalar(e * ex), this.photonRing.quaternion.copy(n.quaternion), this.photonRingMaterial.uniforms.uIntensity.value = 1.6 + t.glow * 0.6, this.accretionDisc.scale.setScalar(e), this.accretionDiscMaterial.uniforms.uTime.value = this.elapsed, this.accretionDiscMaterial.uniforms.uIntensity.value = 0.9 + t.glow * 0.25);
    }
    dispose() {
      for (const t of [
        this.starMesh,
        this.corona,
        this.magnetosphere,
        this.horizon,
        this.photonRing,
        this.accretionDisc,
        this.blastShell
      ]) t.geometry.dispose();
      for (const t of [
        this.starMaterial,
        this.coronaMaterial,
        this.beamMaterial,
        this.magnetosphereMaterial,
        this.horizonMaterial,
        this.photonRingMaterial,
        this.accretionDiscMaterial,
        this.blastShellMaterial
      ]) t.dispose();
      this.beams[0]?.geometry.dispose();
    }
  }
  const Gh = {
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
  class Hi {
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
  const lx = new hh(-1, 1, 1, -1, 0, 1);
  class cx extends Me {
    constructor() {
      super(), this.setAttribute("position", new ue([
        -1,
        3,
        0,
        -1,
        -1,
        0,
        3,
        -1,
        0
      ], 3)), this.setAttribute("uv", new ue([
        0,
        2,
        0,
        0,
        2,
        0
      ], 2));
    }
  }
  const hx = new cx();
  class wo {
    constructor(t) {
      this._mesh = new he(hx, t);
    }
    dispose() {
      this._mesh.geometry.dispose();
    }
    render(t) {
      t.render(this._mesh, lx);
    }
    get material() {
      return this._mesh.material;
    }
    set material(t) {
      this._mesh.material = t;
    }
  }
  class ux extends Hi {
    constructor(t, e) {
      super(), this.textureID = e !== void 0 ? e : "tDiffuse", t instanceof ae ? (this.uniforms = t.uniforms, this.material = t) : t && (this.uniforms = as.clone(t.uniforms), this.material = new ae({
        name: t.name !== void 0 ? t.name : "unspecified",
        defines: Object.assign({}, t.defines),
        uniforms: this.uniforms,
        vertexShader: t.vertexShader,
        fragmentShader: t.fragmentShader
      })), this.fsQuad = new wo(this.material);
    }
    render(t, e, n) {
      this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture), this.fsQuad.material = this.material, this.renderToScreen ? (t.setRenderTarget(null), this.fsQuad.render(t)) : (t.setRenderTarget(e), this.clear && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), this.fsQuad.render(t));
    }
    dispose() {
      this.material.dispose(), this.fsQuad.dispose();
    }
  }
  class mc extends Hi {
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
  class dx extends Hi {
    constructor() {
      super(), this.needsSwap = false;
    }
    render(t) {
      t.state.buffers.stencil.setLocked(false), t.state.buffers.stencil.setTest(false);
    }
  }
  class fx {
    constructor(t, e) {
      if (this.renderer = t, this._pixelRatio = t.getPixelRatio(), e === void 0) {
        const n = t.getSize(new _t());
        this._width = n.width, this._height = n.height, e = new Je(this._width * this._pixelRatio, this._height * this._pixelRatio, {
          type: vn
        }), e.texture.name = "EffectComposer.rt1";
      } else this._width = e.width, this._height = e.height;
      this.renderTarget1 = e, this.renderTarget2 = e.clone(), this.renderTarget2.texture.name = "EffectComposer.rt2", this.writeBuffer = this.renderTarget1, this.readBuffer = this.renderTarget2, this.renderToScreen = true, this.passes = [], this.copyPass = new ux(Gh), this.copyPass.material.blending = _n, this.clock = new n0();
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
          mc !== void 0 && (a instanceof mc ? n = true : a instanceof dx && (n = false));
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
  class px extends Hi {
    constructor(t, e, n = null, s = null, r = null) {
      super(), this.scene = t, this.camera = e, this.overrideMaterial = n, this.clearColor = s, this.clearAlpha = r, this.clear = true, this.clearDepth = false, this.needsSwap = false, this._oldClearColor = new Et();
    }
    render(t, e, n) {
      const s = t.autoClear;
      t.autoClear = false;
      let r, a;
      this.overrideMaterial !== null && (a = this.scene.overrideMaterial, this.scene.overrideMaterial = this.overrideMaterial), this.clearColor !== null && (t.getClearColor(this._oldClearColor), t.setClearColor(this.clearColor, t.getClearAlpha())), this.clearAlpha !== null && (r = t.getClearAlpha(), t.setClearAlpha(this.clearAlpha)), this.clearDepth == true && t.clearDepth(), t.setRenderTarget(this.renderToScreen ? null : n), this.clear === true && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), t.render(this.scene, this.camera), this.clearColor !== null && t.setClearColor(this._oldClearColor), this.clearAlpha !== null && t.setClearAlpha(r), this.overrideMaterial !== null && (this.scene.overrideMaterial = a), t.autoClear = s;
    }
  }
  const mx = {
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
        value: new Et(0)
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
  class Oi extends Hi {
    constructor(t, e, n, s) {
      super(), this.strength = e !== void 0 ? e : 1, this.radius = n, this.threshold = s, this.resolution = t !== void 0 ? new _t(t.x, t.y) : new _t(256, 256), this.clearColor = new Et(0, 0, 0), this.renderTargetsHorizontal = [], this.renderTargetsVertical = [], this.nMips = 5;
      let r = Math.round(this.resolution.x / 2), a = Math.round(this.resolution.y / 2);
      this.renderTargetBright = new Je(r, a, {
        type: vn
      }), this.renderTargetBright.texture.name = "UnrealBloomPass.bright", this.renderTargetBright.texture.generateMipmaps = false;
      for (let d = 0; d < this.nMips; d++) {
        const f = new Je(r, a, {
          type: vn
        });
        f.texture.name = "UnrealBloomPass.h" + d, f.texture.generateMipmaps = false, this.renderTargetsHorizontal.push(f);
        const p = new Je(r, a, {
          type: vn
        });
        p.texture.name = "UnrealBloomPass.v" + d, p.texture.generateMipmaps = false, this.renderTargetsVertical.push(p), r = Math.round(r / 2), a = Math.round(a / 2);
      }
      const o = mx;
      this.highPassUniforms = as.clone(o.uniforms), this.highPassUniforms.luminosityThreshold.value = s, this.highPassUniforms.smoothWidth.value = 0.01, this.materialHighPassFilter = new ae({
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
        new C(1, 1, 1),
        new C(1, 1, 1),
        new C(1, 1, 1),
        new C(1, 1, 1),
        new C(1, 1, 1)
      ], this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors;
      const h = Gh;
      this.copyUniforms = as.clone(h.uniforms), this.blendMaterial = new ae({
        uniforms: this.copyUniforms,
        vertexShader: h.vertexShader,
        fragmentShader: h.fragmentShader,
        blending: Ve,
        depthTest: false,
        depthWrite: false,
        transparent: true
      }), this.enabled = true, this.needsSwap = false, this._oldClearColor = new Et(), this.oldClearAlpha = 1, this.basic = new Ui(), this.fsQuad = new wo(null);
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
      for (let l = 0; l < this.nMips; l++) this.fsQuad.material = this.separableBlurMaterials[l], this.separableBlurMaterials[l].uniforms.colorTexture.value = o.texture, this.separableBlurMaterials[l].uniforms.direction.value = Oi.BlurDirectionX, t.setRenderTarget(this.renderTargetsHorizontal[l]), t.clear(), this.fsQuad.render(t), this.separableBlurMaterials[l].uniforms.colorTexture.value = this.renderTargetsHorizontal[l].texture, this.separableBlurMaterials[l].uniforms.direction.value = Oi.BlurDirectionY, t.setRenderTarget(this.renderTargetsVertical[l]), t.clear(), this.fsQuad.render(t), o = this.renderTargetsVertical[l];
      this.fsQuad.material = this.compositeMaterial, this.compositeMaterial.uniforms.bloomStrength.value = this.strength, this.compositeMaterial.uniforms.bloomRadius.value = this.radius, this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors, t.setRenderTarget(this.renderTargetsHorizontal[0]), t.clear(), this.fsQuad.render(t), this.fsQuad.material = this.blendMaterial, this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture, r && t.state.buffers.stencil.setTest(true), this.renderToScreen ? (t.setRenderTarget(null), this.fsQuad.render(t)) : (t.setRenderTarget(n), this.fsQuad.render(t)), t.setClearColor(this._oldClearColor, this.oldClearAlpha), t.autoClear = a;
    }
    getSeperableBlurMaterial(t) {
      const e = [];
      for (let n = 0; n < t; n++) e.push(0.39894 * Math.exp(-0.5 * n * n / (t * t)) / t);
      return new ae({
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
      return new ae({
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
  Oi.BlurDirectionX = new _t(1, 0);
  Oi.BlurDirectionY = new _t(0, 1);
  const gx = {
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
  class _x extends Hi {
    constructor() {
      super();
      const t = gx;
      this.uniforms = as.clone(t.uniforms), this.material = new J_({
        name: t.name,
        uniforms: this.uniforms,
        vertexShader: t.vertexShader,
        fragmentShader: t.fragmentShader
      }), this.fsQuad = new wo(this.material), this._outputColorSpace = null, this._toneMapping = null;
    }
    render(t, e, n) {
      this.uniforms.tDiffuse.value = n.texture, this.uniforms.toneMappingExposure.value = t.toneMappingExposure, (this._outputColorSpace !== t.outputColorSpace || this._toneMapping !== t.toneMapping) && (this._outputColorSpace = t.outputColorSpace, this._toneMapping = t.toneMapping, this.material.defines = {}, Vt.getTransfer(this._outputColorSpace) === $t && (this.material.defines.SRGB_TRANSFER = ""), this._toneMapping === Fc ? this.material.defines.LINEAR_TONE_MAPPING = "" : this._toneMapping === Oc ? this.material.defines.REINHARD_TONE_MAPPING = "" : this._toneMapping === Bc ? this.material.defines.CINEON_TONE_MAPPING = "" : this._toneMapping === eo ? this.material.defines.ACES_FILMIC_TONE_MAPPING = "" : this._toneMapping === kc ? this.material.defines.AGX_TONE_MAPPING = "" : this._toneMapping === zc && (this.material.defines.NEUTRAL_TONE_MAPPING = ""), this.material.needsUpdate = true), this.renderToScreen === true ? (t.setRenderTarget(null), this.fsQuad.render(t)) : (t.setRenderTarget(e), this.clear && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), this.fsQuad.render(t));
    }
    dispose() {
      this.material.dispose(), this.fsQuad.dispose();
    }
  }
  function vx(i, t, e, n, s, r = {}) {
    const a = new fx(i);
    a.setSize(n, s), a.addPass(new px(t, e));
    const o = new Oi(new _t(n, s), r.strength ?? 0.26, r.radius ?? 0.45, r.threshold ?? 0.72);
    return a.addPass(o), a.addPass(new _x()), {
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
  const gc = 0.04;
  function _c(i, t, e, n) {
    const s = i.x - e[0], r = i.y - e[1], a = i.z - e[2], o = s * t.x + r * t.y + a * t.z, l = s * s + r * r + a * a - n * n, c = o * o - l;
    if (c < 0) return null;
    const h = Math.sqrt(c), d = -o - h;
    if (d >= 0) return d;
    const f = -o + h;
    return f >= 0 ? f : null;
  }
  class xx {
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
    companionLight;
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
      this.renderer = new q_({
        antialias: true,
        powerPreference: "high-performance"
      }), this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)), this.renderer.setSize(n, s), this.renderer.toneMapping = eo, this.renderer.toneMappingExposure = 1.1, this.renderer.outputColorSpace = Be, t.appendChild(this.renderer.domElement), this.scene = new j_(), this.scene.background = new Et(65802), this.scene.add(this.createStarfield()), this.camera = new Ie(55, n / s, 0.02, 2e4), this.camera.position.set(0, 20, 60), this.cameraController = new Fv(this.camera, this.renderer.domElement), this.starLight = new $l(16777215, 1.4, 0, 0), this.scene.add(this.starLight), this.companionLight = new $l(16777215, 0, 0, 0), this.companionLight.visible = false, this.scene.add(this.companionLight), this.scene.add(new e0(3359834, 0.5)), this.starRenderer = new ox(), this.scene.add(this.starRenderer.group), this.particleField = new kv(e.maxParticles, this.renderer.getPixelRatio()), this.scene.add(this.particleField.points), this.bodyRenderer = new dv(), e.cometTailDistance !== void 0 && this.bodyRenderer.setTailActivationDistance(e.cometTailDistance), e.discMetallicity !== void 0 && this.bodyRenderer.setDiscMetallicity(e.discMetallicity), this.scene.add(this.bodyRenderer.group), this.orbits = new Mv(), e.orbitMaxRadius !== void 0 && this.orbits.setMaxRadius(e.orbitMaxRadius), this.scene.add(this.orbits.group), this.labelLayer = document.createElement("div"), this.labelLayer.className = "body-labels", t.appendChild(this.labelLayer), this.labels = new X0({
        container: this.labelLayer,
        locale: e.locale ?? "en",
        ...e.i18n === void 0 ? {} : {
          i18n: e.i18n
        }
      }), this.post = vx(this.renderer, this.scene, this.camera, n, s), this.resizeHandler = () => this.resize(), window.addEventListener("resize", this.resizeHandler);
    }
    render(t, e) {
      const n = Number.isFinite(e) && e > 0 ? e : 0, s = t.paused === true ? 0 : n;
      this.particleField.update(t.particles, t.particleCount);
      const r = s > 0 ? Math.min(1, s * 1.5) : 1, a = Mx(t.stage);
      this.dustBrightness += (a - this.dustBrightness) * r, this.particleField.setBrightness(this.dustBrightness), this.lastBodies = t.bodies, this.lastBodyCount = t.bodyCount;
      const o = D0(t.stage, t.mass, t.stageProgress, t.remnant, t.composition, t.supernova === true, t.cloudExtent);
      this.cameraController.setKeepOutRadius(o.visible ? o.radius : 0), this.cameraController.update(n);
      const l = Number.isFinite(t.simDt) && (t.simDt ?? 0) > 0 ? t.simDt : 0, c = this.renderer.domElement.clientHeight || this.container.clientHeight;
      this.bodyRenderer.update(t.bodies, t.bodyCount, l, this.camera, c), this.orbits.update(t.bodies, t.bodyCount, t.mu);
      const h = this.bodyRenderer.luminousCompanion;
      this.companionLight.visible = h !== null, h !== null && (this.companionLight.position.set(h.position[0], h.position[1], h.position[2]), this.companionLight.color.setRGB(h.color.r, h.color.g, h.color.b), this.companionLight.intensity = Math.min(1.4, 0.35 + h.glow * 0.65)), this.starRenderer.update(o, s, this.camera, c), this.starLight.visible = o.visible, this.starLight.color.setRGB(o.color.r, o.color.g, o.color.b), this.starLight.intensity = o.visible ? 0.95 + o.glow * 0.35 : 0, this.lastStarRadius = o.radius || 1, this.post.render(n), this.labels.update(t.bodies, t.bodyCount, this.camera, this.renderer.domElement, t.stage, t.mass, t.remnant, this.lastStarRadius);
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
      this.orbits.setEnabled(t), this.bodyRenderer.setMoonOrbitsVisible(t);
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
      const s = (t - n.left) / n.width * 2 - 1, r = -((e - n.top) / n.height) * 2 + 1, a = new i0();
      a.setFromCamera(new _t(s, r), this.camera);
      const { origin: o, direction: l } = a.ray;
      let c = null, h = 1 / 0;
      const d = _c(o, l, [
        0,
        0,
        0
      ], Math.max(this.lastStarRadius * 2.5, o.length() * gc));
      d !== null && d < h && (h = d, c = {
        kind: "star"
      });
      for (let f = 0; f < this.lastBodyCount; f += 1) {
        const p = f * Nn, g = [
          this.lastBodies[p + Bt.x] ?? 0,
          this.lastBodies[p + Bt.y] ?? 0,
          this.lastBodies[p + Bt.z] ?? 0
        ], _ = this.lastBodies[p + Bt.radius] ?? 0.5, m = Math.hypot(g[0] - o.x, g[1] - o.y, g[2] - o.z), u = _c(o, l, g, Math.max(_ * 2, m * gc));
        u !== null && u < h && (h = u, c = {
          kind: "body",
          id: this.lastBodies[p + Bt.id] ?? -1,
          type: this.lastBodies[p + Bt.type] ?? kt.Planet,
          radius: _,
          mass: this.lastBodies[p + Bt.mass] ?? 0,
          captured: (this.lastBodies[p + Bt.captured] ?? 0) !== 0
        });
      }
      return c;
    }
    findBody(t) {
      for (let e = 0; e < this.lastBodyCount; e += 1) {
        const n = e * Nn;
        if ((this.lastBodies[n + Bt.id] ?? -1) === t) return {
          position: [
            this.lastBodies[n + Bt.x] ?? 0,
            this.lastBodies[n + Bt.y] ?? 0,
            this.lastBodies[n + Bt.z] ?? 0
          ],
          radius: this.lastBodies[n + Bt.radius] ?? 0.5
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
      const s = new Me();
      s.setAttribute("position", new xe(e, 3)), s.setAttribute("color", new xe(n, 3));
      const r = new _h({
        size: 1,
        sizeAttenuation: false,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      }), a = new vh(s, r);
      return a.frustumCulled = false, a;
    }
  }
  function Mx(i) {
    switch (i) {
      case nt.DustCloud:
      case nt.ProtostarCoalescence:
      case nt.FusionIgnition:
        return 1;
      case nt.MainSequence:
      case nt.RedGiant:
        return 0.7;
      case nt.Death:
        return 1;
      case nt.Remnant:
        return 0.85;
      default:
        return 0.7;
    }
  }
  const Vh = {
    [nt.DustCloud]: "stage.dustCloud",
    [nt.ProtostarCoalescence]: "stage.protostarCoalescence",
    [nt.FusionIgnition]: "stage.fusionIgnition",
    [nt.MainSequence]: "stage.mainSequence",
    [nt.RedGiant]: "stage.redGiant",
    [nt.Death]: "stage.death",
    [nt.Remnant]: "stage.remnant"
  }, ja = "star", Wh = "none", vc = [
    {
      value: ja,
      labelMessageId: "hud.focus.star"
    },
    {
      value: Wh,
      labelMessageId: "hud.focus.none"
    }
  ];
  class Sx {
    i18n;
    locale;
    root;
    pauseButton;
    pausedBadge;
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
    stage = nt.DustCloud;
    bodyCount = 0;
    elapsedYears = 0;
    speedYearsPerSecond = 0;
    focusOptions = [
      ...vc
    ];
    constructor(t) {
      this.i18n = t.i18n ?? ti, this.locale = t.locale, this.root = document.createElement("div"), this.root.className = "hud", this.pausedBadge = document.createElement("div"), this.pausedBadge.className = "hud-paused", this.pausedBadge.hidden = true, this.translatables.set(this.pausedBadge, "hud.paused"), t.container.appendChild(this.pausedBadge), this.stageLabel = document.createElement("div"), this.stageLabel.className = "hud-stage", this.bodyCountLabel = document.createElement("div"), this.bodyCountLabel.className = "hud-body-count", this.elapsedLabel = document.createElement("div"), this.elapsedLabel.className = "hud-elapsed", this.root.append(this.stageLabel, this.bodyCountLabel, this.elapsedLabel);
      const e = this.field("hud.timeScale");
      this.paceInput = document.createElement("input"), this.paceInput.type = "range", this.paceInput.min = "0", this.paceInput.max = "1", this.paceInput.step = "0.01", this.paceInput.value = String(t.initialPace ?? 0.5), this.paceInput.addEventListener("input", () => {
        t.onPaceChange(Number(this.paceInput.value));
      }), e.appendChild(this.paceInput), this.speedLabel = document.createElement("span"), this.speedLabel.className = "hud-speed", e.appendChild(this.speedLabel), this.pauseButton = this.button("hud.pause", t.onTogglePause), this.pauseButton.title = this.t("hud.pauseHint");
      const n = t.onToggleRewind;
      n !== void 0 && (this.rewindButton = this.button("hud.rewind", () => {
        this.setRewinding(!this.rewinding), n(this.rewinding);
      })), this.button("hud.reset", t.onReset), this.button("hud.zoomIn", t.onZoomIn), this.button("hud.zoomOut", t.onZoomOut);
      const s = t.onToggleOrbits;
      s !== void 0 && (this.orbitsInput = this.checkbox("hud.orbits", t.initialOrbits ?? false, (o) => s(o)));
      const r = t.onToggleLabels;
      r !== void 0 && (this.labelsInput = this.checkbox("hud.labels", t.initialLabels ?? false, (o) => r(o)));
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
      this.paused = t, this.translatables.set(this.pauseButton, t ? "hud.resume" : "hud.pause"), this.pauseButton.textContent = this.t(t ? "hud.resume" : "hud.pause"), this.pauseButton.classList.toggle("hud-button--active", t), this.pausedBadge.hidden = !t;
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
        stage: this.t(Vh[t])
      });
    }
    setBodyCount(t) {
      this.bodyCount = t, this.bodyCountLabel.textContent = this.t("hud.bodyCount", {
        count: t
      });
    }
    setElapsedYears(t) {
      this.elapsedYears = t, this.elapsedLabel.textContent = this.t("hud.elapsed", {
        time: Ho(t, this.i18n, this.locale)
      });
    }
    setSpeedYearsPerSecond(t) {
      this.speedYearsPerSecond = t, this.speedLabel.textContent = this.t("hud.speed", {
        value: Ho(t, this.i18n, this.locale)
      });
    }
    setFocusOptions(t) {
      this.focusOptions = [
        ...vc,
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
      this.pauseButton.title = this.t("hud.pauseHint"), this.setPaused(this.paused), this.setStage(this.stage), this.setBodyCount(this.bodyCount), this.setElapsedYears(this.elapsedYears), this.setSpeedYearsPerSecond(this.speedYearsPerSecond), this.renderFocusOptions();
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
      this.root.remove(), this.pausedBadge.remove();
    }
  }
  const yx = (() => {
    const i = {};
    for (const t of Object.keys(nc)) {
      const e = Number(t), n = nc[e];
      n !== void 0 && (i[n] = e);
    }
    return i;
  })(), xc = {
    [Pt.WhiteDwarf]: "remnant.whiteDwarf",
    [Pt.NeutronStar]: "remnant.neutronStar",
    [Pt.Pulsar]: "remnant.pulsar",
    [Pt.BlackHole]: "remnant.blackHole",
    [Pt.BrownDwarf]: "remnant.brownDwarf"
  }, rr = {
    [kt.Protoplanet]: "body.protoplanet",
    [kt.Planet]: "body.planet",
    [kt.Comet]: "body.comet",
    [kt.Asteroid]: "body.asteroid",
    [kt.BrownDwarf]: "body.brownDwarf",
    [kt.Star]: "body.star"
  };
  function Ex(i, t, e) {
    const n = {}, s = i.data;
    if (!s) return n;
    const r = s.remnant;
    typeof r == "number" && r in xc && (n.remnant = t.translate(e, xc[r]));
    const a = s.bodyType;
    return typeof a == "number" && a in rr && (n.body = t.translate(e, rr[a])), typeof s.bodyId == "number" && (n.id = s.bodyId), typeof s.massSolar == "number" && (n.mass = dr(s.massSolar)), n;
  }
  function bx(i) {
    return i.type === Le.DeathEvent ? i.data?.supernova === true ? "event.supernova" : "event.planetaryNebula" : i.messageId;
  }
  class Tx {
    i18n;
    locale;
    enabled;
    maxVisible;
    root;
    constructor(t) {
      this.i18n = t.i18n ?? ti, this.locale = t.locale, this.enabled = t.enabled, this.maxVisible = t.maxVisible ?? 6, this.root = document.createElement("div"), this.root.className = "event-annotations", this.root.setAttribute("aria-live", "polite"), t.container.appendChild(this.root);
    }
    get element() {
      return this.root;
    }
    resolve(t) {
      return this.enabled ? this.i18n.translate(this.locale, bx(t), Ex(t, this.i18n, this.locale)) : null;
    }
    show(t) {
      const e = this.resolve(t);
      if (e === null) return null;
      const n = document.createElement("div");
      n.className = "event-annotation";
      const s = yx[t.type];
      if (s !== void 0) {
        n.classList.add("event-annotation--stage");
        const r = document.createElement("span");
        r.className = "event-annotation__stage", r.textContent = this.i18n.translate(this.locale, Vh[s]);
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
  class wx {
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
      this.i18n = t.i18n ?? ti, this.locale = t.locale, this.root = document.createElement("div"), this.root.className = "body-info", this.root.hidden = true;
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
  class Ax {
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
  const Cx = 1, Rx = 138e8 * 365.25 * 24 * 3600, Px = 60;
  function Ka(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  function Dx(i, t, e, n) {
    const s = Ka(i, 0, 1), r = e / n;
    return t <= 0 ? r * s : t * Math.pow(r / t, s);
  }
  class Lx {
    paceValue;
    pausedValue = false;
    simTimeValue = 0;
    nearRealRate;
    lifecycleSimSeconds;
    fullCycleRealSeconds;
    constructor(t = {}) {
      this.nearRealRate = t.nearRealRate ?? Cx, this.lifecycleSimSeconds = t.lifecycleSimSeconds ?? Rx, this.fullCycleRealSeconds = t.fullCycleRealSeconds ?? Px, this.paceValue = Ka(t.pace ?? 0.5, 0, 1);
    }
    get pace() {
      return this.paceValue;
    }
    setPace(t) {
      this.paceValue = Ka(t, 0, 1);
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
      return Dx(this.paceValue, this.nearRealRate, this.lifecycleSimSeconds, this.fullCycleRealSeconds);
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
  function Mc(i, t, e) {
    return Math.min(e, Math.max(t, i));
  }
  class Ix {
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
      return this.frames.length === 0 ? null : (this.cursorValue = Mc(this.cursorValue + t, 0, this.frames.length - 1), this.currentFrame());
    }
    currentFrame() {
      if (this.frames.length === 0) return null;
      const t = Math.round(Mc(this.cursorValue, 0, this.frames.length - 1));
      return this.frames[t] ?? null;
    }
    clear() {
      this.frames = [], this.cursorValue = 0;
    }
  }
  const Xh = 4e3, Yh = 0.2, Ux = 240, Sc = 4 / Yh;
  class Nx {
    clock;
    config;
    kernel;
    particleCount;
    remnantType;
    supernova;
    stellarMass;
    stage = nt.DustCloud;
    progress = 0;
    elapsed = 0;
    starMass = 0;
    history = new Ix(Ux);
    rewinding = false;
    recordAccumulator = 0;
    constructor(t, e, n = {}) {
      this.config = t, this.kernel = e, this.particleCount = n.particleCount ?? Xh, this.clock = n.clock ?? new Lx({
        pace: t.pace,
        ...n.clockOptions
      });
      const s = n.fateModel ?? ru;
      this.stellarMass = bc(t.mass, t.composition.metals);
      const r = s.determineFate(this.stellarMass, t.composition);
      this.remnantType = r.remnant, this.supernova = r.supernova, this.starMass = this.stellarMass, this.kernel.init({
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
        const h = this.replay(-Sc * e);
        if (h !== null) return h;
      } else if (!this.history.isLive) {
        const h = this.replay(Sc * e);
        if (h !== null) return h;
      }
      const n = this.clock.advance(t), { events: s, stage: r, stageProgress: a, elapsedSimSeconds: o, starMassSolar: l } = this.kernel.step(n);
      this.stage = r, this.progress = a, this.elapsed = o, this.starMass = Number.isFinite(l) ? l : this.stellarMass;
      const c = this.buildState(r);
      return c.simDt = n, this.maybeRecord(e, c), {
        state: c,
        events: s,
        elapsed: this.elapsed,
        fromHistory: false
      };
    }
    replay(t) {
      const e = this.history.seek(t);
      return e === null ? null : (this.stage = e.state.stage, this.progress = e.state.stageProgress, this.elapsed = e.elapsed, this.starMass = e.state.mass, {
        state: e.state,
        events: [],
        elapsed: e.elapsed,
        fromHistory: true
      });
    }
    maybeRecord(t, e) {
      this.recordAccumulator += t, (this.history.size === 0 || this.recordAccumulator >= Yh) && (this.recordAccumulator = 0, this.history.record({
        state: Fx(e),
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
      }), this.clock.reset(), this.stage = nt.DustCloud, this.progress = 0, this.elapsed = 0, this.starMass = 0, this.history.clear(), this.rewinding = false, this.recordAccumulator = 0;
    }
    dispose() {
      this.kernel.dispose();
    }
    buildState(t) {
      const e = this.kernel.getParticleBuffer(), n = this.kernel.getBodyBuffer(), s = this.kernel.getAttractorBuffer();
      return {
        particles: e,
        particleCount: Math.floor(e.length / Qa),
        bodies: n,
        bodyCount: Math.floor(n.length / Nn),
        attractors: s,
        attractorCount: this.kernel.attractorCount(),
        stage: t,
        stageProgress: this.progress,
        mass: this.starMass,
        cloudMass: this.config.mass,
        cloudExtent: this.config.cloudExtent,
        paused: this.clock.paused,
        composition: this.config.composition,
        mu: this.kernel.orbitalMu(),
        remnant: t === nt.Remnant ? this.remnantType : null,
        supernova: this.supernova
      };
    }
  }
  function Fx(i) {
    const { simDt: t, ...e } = i;
    return {
      ...e,
      particles: i.particles.slice(0, i.particleCount * Qa),
      bodies: i.bodies.slice(0, i.bodyCount * Nn),
      attractors: i.attractors.slice(0, i.attractorCount * Su),
      composition: {
        ...i.composition
      }
    };
  }
  const Ox = 6, Gs = "body:";
  class Bx {
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
    onKeyDown = (t) => this.handleKeyDown(t);
    constructor(t) {
      this.container = t.container, this.config = t.config, this.locale = t.config.locale, this.onExit = t.onExit, this.i18n = t.i18n ?? ti, this.container.classList.add("run-screen"), this.container.style.position = "relative", this.container.style.width = "100vw", this.container.style.height = "100vh", this.container.style.overflow = "hidden", this.canvasHost = document.createElement("div"), this.canvasHost.className = "run-canvas", this.canvasHost.style.position = "absolute", this.canvasHost.style.inset = "0", this.overlay = document.createElement("div"), this.overlay.className = "run-overlay", this.overlay.style.position = "absolute", this.overlay.style.inset = "0", this.overlay.style.pointerEvents = "none", this.container.append(this.canvasHost, this.overlay);
    }
    async start() {
      const t = Xh, e = await Pu();
      if (this.disposed) {
        e.dispose();
        return;
      }
      this.runner = new Nx(this.config, e, {
        particleCount: t
      }), this.scene = new xx(this.canvasHost, {
        maxParticles: t,
        cometTailDistance: this.config.cloudExtent * 0.5,
        discMetallicity: this.config.composition.metals,
        orbitMaxRadius: Ic,
        locale: this.locale,
        i18n: this.i18n
      }), this.hud = new Sx({
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
        initialLabels: false,
        initialOrbits: false
      }), this.scene.setLabelsEnabled(this.hud.labelsChecked), this.scene.setOrbitsEnabled(this.hud.orbitsChecked), this.hud.element.style.pointerEvents = "auto", this.annotations = new Tx({
        container: this.overlay,
        i18n: this.i18n,
        locale: this.locale,
        enabled: this.config.showEventAnnotations
      }), this.infoPanel = new wx({
        container: this.overlay,
        i18n: this.i18n,
        locale: this.locale
      }), this.infoPanel.element.style.pointerEvents = "auto", this.contextMenu = new Ax(this.overlay), this.scene.domElement.addEventListener("pointerdown", this.onPointerDown), this.scene.domElement.addEventListener("pointerup", this.onPointerUp), this.scene.domElement.addEventListener("contextmenu", this.onContextMenu), window.addEventListener("keydown", this.onKeyDown), this.scene.start((n) => this.frame(n));
    }
    destroy() {
      this.disposed = true, window.removeEventListener("keydown", this.onKeyDown), this.scene !== null && (this.scene.domElement.removeEventListener("pointerdown", this.onPointerDown), this.scene.domElement.removeEventListener("pointerup", this.onPointerUp), this.scene.domElement.removeEventListener("contextmenu", this.onContextMenu)), this.scene?.dispose(), this.hud?.destroy(), this.annotations?.destroy(), this.infoPanel?.destroy(), this.contextMenu?.destroy(), this.runner?.dispose(), this.scene = null, this.hud = null, this.annotations = null, this.infoPanel = null, this.contextMenu = null, this.runner = null, this.container.replaceChildren(), this.container.classList.remove("run-screen");
    }
    frame(t) {
      const e = this.runner;
      if (e === null) return null;
      const { state: n, events: s, elapsed: r } = e.tick(t);
      this.lastStage = n.stage, this.lastRemnant = n.remnant;
      const a = this.annotations;
      if (a !== null) for (const l of s) a.show(l);
      const o = this.hud;
      return o !== null && (o.setStage(n.stage), o.setBodyCount(n.bodyCount), o.setElapsedYears(Bo(r)), o.setSpeedYearsPerSecond(Bo(e.clock.currentRate())), this.syncFocusOptions(n)), n;
    }
    handlePointerUp(t) {
      if (t.button !== 0 || Math.hypot(t.clientX - this.pointerDownX, t.clientY - this.pointerDownY) > Ox) return;
      const n = this.scene?.pickAtClient(t.clientX, t.clientY);
      if (!n) {
        this.infoPanel?.hide();
        return;
      }
      const s = n.kind === "star" ? {
        kind: "star",
        stage: this.lastStage ?? 0,
        remnant: this.lastRemnant,
        discMetallicity: this.config.composition.metals
      } : {
        kind: "body",
        type: n.type,
        radius: n.radius,
        mass: n.mass,
        captured: n.captured
      };
      this.infoPanel?.show(f0(s));
    }
    handleContextMenu(t) {
      t.preventDefault();
      const e = this.scene?.pickAtClient(t.clientX, t.clientY);
      if (!e) {
        this.contextMenu?.close();
        return;
      }
      const n = e.kind === "star" ? ja : `${Gs}${e.id}`, s = e.kind === "star" ? this.i18n.translate(this.locale, "hud.focus.star") : this.i18n.translate(this.locale, "hud.focus.body", {
        body: this.i18n.translate(this.locale, rr[e.type] ?? "body.planet"),
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
    handleKeyDown(t) {
      if (t.defaultPrevented || t.metaKey || t.ctrlKey || t.altKey) return;
      const e = t.target;
      e instanceof HTMLElement && (e.isContentEditable || e instanceof HTMLInputElement || e instanceof HTMLSelectElement || e instanceof HTMLTextAreaElement) || (t.code === "Space" || t.key === " " || t.key === "k" || t.key === "K") && (t.preventDefault(), this.handleTogglePause());
    }
    handleFocusChange(t) {
      const e = this.scene;
      if (e !== null) {
        if (t === ja) e.focusOnStar();
        else if (t === Wh) e.cameraController.clearFollow();
        else if (t.startsWith(Gs)) {
          const n = Number(t.slice(Gs.length));
          Number.isFinite(n) && e.focusOnBody(n);
        }
      }
    }
    syncFocusOptions(t) {
      let e = "";
      const n = [];
      for (let s = 0; s < t.bodyCount; s += 1) {
        const r = s * Nn, a = t.bodies[r + Bt.id] ?? 0, o = t.bodies[r + Bt.type] ?? 0;
        e += `${a}:${o},`, n.push({
          value: `${Gs}${a}`,
          labelMessageId: "hud.focus.body",
          params: {
            body: this.i18n.translate(this.locale, rr[o] ?? "body.planet"),
            id: a
          }
        });
      }
      e !== this.focusSignature && (this.focusSignature = e, this.hud?.setFocusOptions(n));
    }
  }
  class kx {
    root;
    i18n;
    setupForm = null;
    runScreen = null;
    lastConfig = null;
    constructor(t, e = ti) {
      this.root = t, this.i18n = e, this.showSetup();
    }
    showSetup() {
      this.teardownRun(), this.root.replaceChildren(), this.setupForm = new Mu({
        container: this.root,
        i18n: this.i18n,
        initialLocale: this.lastConfig?.locale ?? "en",
        initialPresetId: this.lastConfig?.presetId ?? ta,
        onSubmit: (t) => {
          this.startRun(t);
        }
      });
    }
    async startRun(t) {
      this.lastConfig = t, this.teardownSetup(), this.root.replaceChildren();
      const e = new Bx({
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
  const qh = document.getElementById("app");
  if (!qh) throw new Error("Root element #app not found");
  new kx(qh);
})();
