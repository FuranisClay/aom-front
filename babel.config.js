module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 将旧的名称替换为新的名称
    '@babel/plugin-transform-optional-chaining'
  ]
}
