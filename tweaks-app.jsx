/* Tweaks app — applies design variations to the live portfolio.
   The portfolio itself is plain HTML; this React island only renders
   the panel and writes CSS vars / data-attrs onto the document root. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "hero": "split",
  "accent": ["oklch(0.82 0.16 185)", "oklch(0.86 0.12 185)", "oklch(0.55 0.11 185)"],
  "font": "Space Grotesk",
  "glow": true,
  "scanlines": true
}/*EDITMODE-END*/;

const ACCENTS = [
  ["oklch(0.82 0.16 185)", "oklch(0.86 0.12 185)", "oklch(0.55 0.11 185)"], // teal
  ["oklch(0.78 0.14 245)", "oklch(0.83 0.11 248)", "oklch(0.52 0.12 250)"], // azure
  ["oklch(0.77 0.15 305)", "oklch(0.82 0.11 305)", "oklch(0.53 0.13 305)"], // violet
  ["oklch(0.86 0.17 150)", "oklch(0.89 0.12 150)", "oklch(0.58 0.13 150)"]  // lime
];

function applyTweaks(t) {
  const root = document.documentElement;
  document.body.setAttribute('data-hero', t.hero);
  const a = Array.isArray(t.accent) ? t.accent : ACCENTS[0];
  root.style.setProperty('--accent', a[0]);
  root.style.setProperty('--accent-2', a[1]);
  root.style.setProperty('--accent-deep', a[2]);
  root.style.setProperty('--font-display', `"${t.font}", system-ui, sans-serif`);
  document.body.classList.toggle('no-glow', !t.glow);
  document.body.classList.toggle('no-scan', !t.scanlines);
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyTweaks(t); }, [t]);

  return (
    <TweaksPanel>
      <TweakSection label="Hero layout" />
      <TweakRadio label="Composition" value={t.hero}
                  options={['split', 'centered']}
                  onChange={(v) => setTweak('hero', v)} />

      <TweakSection label="Accent" />
      <TweakColor label="Signal color" value={t.accent}
                  options={ACCENTS}
                  onChange={(v) => setTweak('accent', v)} />

      <TweakSection label="Type" />
      <TweakRadio label="Display font" value={t.font}
                  options={['Space Grotesk', 'Sora']}
                  onChange={(v) => setTweak('font', v)} />

      <TweakSection label="Atmosphere" />
      <TweakToggle label="Ambient glow" value={t.glow}
                   onChange={(v) => setTweak('glow', v)} />
      <TweakToggle label="Portrait scanlines" value={t.scanlines}
                   onChange={(v) => setTweak('scanlines', v)} />
    </TweaksPanel>
  );
}

// apply defaults immediately (before React mounts) to avoid flash
applyTweaks(TWEAK_DEFAULTS);

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TweaksApp />);
