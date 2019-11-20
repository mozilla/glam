import { storiesOf } from "@storybook/svelte";
import Buttons from "./Buttons.svelte";
import ButtonGroupStory from "./ButtonGroupStory.svelte";
import "../public/static/global.css";
import "./glean-design-stories.css";

storiesOf("UX Components|Buttons", module)
  .add("Buttons", () => ({
    Component: Buttons
  }))
  .add("Button Groups", () => ({
    Component: ButtonGroupStory
  }));
