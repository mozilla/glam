<script>
import { timeFormat } from 'd3-time-format';

const formatDate = timeFormat('%Y-%m-%d');
const formatTime = timeFormat('%H:%M:%S');
export let label;
export let scrollLeft = 0;

</script>

<style>
.data-cell__build-id {
  font-family: var(--main-mono-font);
}

.data-cell__build-id__date {
  font-weight: bold;
  color: var(--cool-gray-500);
}

</style>

<td class="data-cell data-cell--main" style="transform: translateX({scrollLeft}px);">
    <div class=data-cell__build-id>
      <div class=data-cell__build-id__date>
        {formatDate(label)}
      </div>
      <div>
        {formatTime(label)}
    </div>
  </div>
</td>