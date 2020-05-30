<script>
export let color = 'white';
export let size = 24;
</script>

<style>
.spin {
  --color: #fff;
  --s: 24px;
  --i: calc(var(--s) * 0.09);
  display: inline-block;
  position: relative;
  width: var(--s);
  height: var(--s);
}
.spin div {
  width: calc(var(--s) * 0.796875);
  height: calc(var(--s) * 0.796875);
  margin: var(--i);
  border: var(--i) solid var(--color);
  box-sizing: border-box;
  display: block;
  position: absolute;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--color) transparent transparent transparent;
}
.spin div:nth-child(1) {
  animation-delay: -0.45s;
}
.spin div:nth-child(2) {
  animation-delay: -0.3s;
}
.spin div:nth-child(3) {
  animation-delay: -0.15s;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>

<div class=spin style="--color:{color}; --s:{size}px;">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
</div>
