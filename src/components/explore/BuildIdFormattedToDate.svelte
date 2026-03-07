<script>
  export let buildIdHour;
</script>

<style>
  .big-label__value__date {
    font-weight: bold;
    color: var(--cool-gray-700);
  }

  .big-label__value__time {
    color: var(--cool-gray-600);
  }
</style>

<span class="big-label__value__date">
  {buildIdHour.slice(0, 4)}-{buildIdHour.slice(4, 6)}-{buildIdHour.slice(
    6,
    8
  )}</span>
<span class="big-label__value__time">{buildIdHour.slice(8, 10)}:</span><span
  class="big-label__value__time">{buildIdHour.slice(10, 12)}:</span
><span class="big-label__value__time">{buildIdHour.slice(12, 14)}</span>
