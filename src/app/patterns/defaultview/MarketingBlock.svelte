<script>
import { tweened } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';
import Button from '../../../components/Button.svelte';

const t = tweened(0, { duration: 500, easing });
$: $t = 1;
</script>

<style>
/* 
.marketing-block {
  background: linear-gradient(to bottom right, var(--blue-slate-700), var(--blue-slate-800));
  color: white;
  padding: var(--space-4x);
}

.marketing-block__inner-container {
  width: var(--space-72x);
}

.marketing-block__title {
  margin:0;
  margin-bottom: var(--space-4x);
  line-height:1.2;
  font-size: var(--text-08);
}

.marketing-block__description {
  margin-bottom: var(--space-4x);
}

.marketing-block__call-to-action {
  margin-top: var(--space-2x);
  margin-bottom: var(--space-4x);
}

.marketing-block__ask-us {
  font-weight: 200;
  font-style: italic;
} */


.marketing-block {
  padding: var(--space-4x);
    background: linear-gradient(to top, white, transparent), url('bg.jpg');
    background-position: top right -100px;
  background-repeat: no-repeat;
}

.marketing-block__inner-container {
  width: var(--space-72x);
}

.marketing-block__title {
  margin:0;
  margin-bottom: var(--space-4x);
  line-height:1.2;
  font-size: var(--text-08);
}

.marketing-block__description {
  margin-bottom: var(--space-4x);
}

.marketing-block__call-to-action {
  margin-top: var(--space-2x);
  margin-bottom: var(--space-4x);
}

.marketing-block__ask-us {
  font-weight: 200;
  font-style: italic;
}

</style>

<div class='marketing-block'>
  <div class='marketing-block__inner-container'>
    <h2 class='marketing-block__title'>Uncover trends and insights about your product's telemetry probes.</h2>
    <div class='marketing-block__description'>
      Currently serving: Firefox. Coming soon: Fenix.
    </div>
    <!-- <img src='bg.jpg' alt='yes' /> -->
    <div class='marketing-block__call-to-action'>
      <Button tooltip="coming soon!">Documentation</Button>
    </div>

    <div class='marketing-block__ask-us'>
      Questions? Bugs? Requests? Find us at #GLAM on Slack.
    </div>
  </div>
</div>