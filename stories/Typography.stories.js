import { storiesOf } from "@storybook/svelte";
import TypographySizes from "./TypographySizes.svelte";
import Fonts from "./Fonts.svelte";

import "../public/static/global.css";

storiesOf("Principles|Typography", module)
  .add("Sizes", () => ({
    Component: TypographySizes
  }))
  .add("Fonts", () => ({
    Component: Fonts
  }));
