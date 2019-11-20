import { storiesOf } from "@storybook/svelte";
import RadioExamples from "./RadioExamples.svelte";

import "../public/static/global.css";

storiesOf("UX Components|Radio", module).add("Basic Radio Buttons", () => ({
  Component: RadioExamples
}));
