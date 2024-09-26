# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

# TECHNICAL INDCIATORS

## TREND

Trend is based on a 45M timeframe and uses:

- 1 EMA as the short window
- 50 EMA as the long window

Trend is considered bullish when the short window crosses above the long window for more than 3 candles.

It is oberserved that trend usually reverses within 12 to 48 hours in choppy markets.

## STOCHASTICS

Based on a 45M timeframe and uses:

- 96 Length (translate to about 3 days)
- 1 K Smoothing
- 3 D Smoothing

A mean reversion indicator that:

- signals the start of a bull when the k mean cross above 20 from below
- signals the start of a bear when the k mean cross below 80 from the top

## MACD-V

Fast 12
Slow 26
ATR 26

## 45M Timeframe

Scalping indicator

- Bull when macd crosses over the ema from below
- Bear when macd corsses over the ema from top

## 180 Timeframe

Overbought/oversold indicator
Overbought: cross over 150 from top
Oversold: cross over -150 from below

# STRATEGIES

## TREND + STOCH

This strategies assumes that trend is a lagging indicator.

Long Signal: when STOCH signals bull & trend is still in bearish phase
Short Signal: when STOCH signals bear & trend is still in bullish phase
