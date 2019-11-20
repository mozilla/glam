import { storiesOf } from "@storybook/svelte";
import SimpleAxisStory from "./SimpleAxisStory.svelte";

import "../../../public/static/global.css";

storiesOf("Data Graphics|Basics", module).add("Simple Axes", () => ({
  Component: SimpleAxisStory
}));
