<template>
  <router-view />
</template>

<style>
/* 确保 body 占满全屏，防止背景色不全 */
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  height: 100%;
  padding: 0;
  margin: 0;
  max-width: none; /* 覆盖默认样式 */
  text-align: left; /* 覆盖默认居中 */
}
</style>