const { withMainActivity } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const HIGH_REFRESH_RATE = `    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      display?.let { screen ->
        val current = screen.mode
        screen.supportedModes
          .filter { it.physicalWidth == current.physicalWidth && it.physicalHeight == current.physicalHeight }
          .maxByOrNull { it.refreshRate }
          ?.let { best -> window.attributes = window.attributes.apply { preferredDisplayModeId = best.modeId } }
      }
    }`;

const withHighRefreshRate = (config) =>
  withMainActivity(config, (mod) => {
    if (mod.modResults.language !== 'kt') return mod;
    let contents = mod.modResults.contents;
    if (!contents.includes('import android.os.Build')) {
      contents = contents.replace(/\nimport /, '\nimport android.os.Build\nimport ');
    }
    mod.modResults.contents = mergeContents({
      tag: 'doctimings-high-refresh-rate',
      src: contents,
      newSrc: HIGH_REFRESH_RATE,
      anchor: /super\.onCreate\(/,
      offset: 1,
      comment: '//',
    }).contents;
    return mod;
  });

module.exports = withHighRefreshRate;
