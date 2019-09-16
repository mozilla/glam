<script>

import { getContext } from 'svelte';

export let level = 'high';
export let compact = false;
export let pale = false;

export let size = compact ? 'compact' : 'standard';
export let dark = getContext('appDarkMode') || false;

const paleness = pale ? 'pale' : 'normal-saturation';

</script>

<style>

button {
    cursor: pointer;
    font-size: var(--button-text-size);
    text-transform: uppercase;
    border-radius: var(--border-radius-1h);
    padding: var(--space-base);
    padding-left: var(--space-2x);
    padding-right: var(--space-2x);
    font-weight:500;
    margin: 0;
    display: flex;
    column-gap: var(--space-base);
    text-align: center;
}

/* high emphasis, medium emphasis, low emphasis */

.button--high {
    background-color: var(--digital-blue);
    border-color: var(--digital-blue);
    color: white;
}

.button--high:hover {
    box-shadow: var(--elevation-base);
}

.button--high:active {
    box-shadow: none;
    background-color: var(--digital-blue-darker);
}

.button--medium {
    background-color: transparent;
    color: var(--digital-blue);
}

.button--medium:hover,.button--low:hover {
    background-color: rgba(0,0,0,.1);
}

.button--medium:active, .button--low:active {
    background-color: rgba(0,0,0,.2);
}

.button--low {
    background-color: transparent;
    color: var(--digital-blue);
    border: 1px solid transparent;
}

.dark.button--high {
    background-color: var(--digital-blue-lighter);
    border-color: var(--digital-blue-lighter);
    color: black;
}

.dark.button--high:hover {
    box-shadow: var(--elevation-base);
}

.dark.button--high:active {
    box-shadow: none;
    background-color: var(--digital-blue-lightest);
    border-color: var(--digital-blue-lightest);
}

.dark.button--medium {
    background-color: transparent;
    color: var(--digital-blue-lighter);
    border-color: var(--digital-blue-lighter);
}

.dark.button--medium:hover, .dark.button--low:hover {
    background-color: var(--digital-blue-darker);
}

.dark.button--medium:active, .dark.button--low:active {
    background-color: rgba(0,0,0,.2);
    color: var(--digital-blue-lightest);
}

.dark.button--medium:active {
    border-color: var(--digital-blue-lightest);
}

.dark.button--low {
    background-color: transparent;
    color: var(--digital-blue-lighter);
    border: 1px solid transparent;
}

/* I don't like how to select dark mode here. Yikes. */
.button--compact, .dark.button--compact {
    padding: var(--space-1h);
    padding-left: var(--space-base);
    padding-right: var(--space-base);
    font-size: var(--button-text-size-compact);
    column-gap: var(--space-1h);
}

/* desaturate. */
.button--high.button--pale {
    color: var(--digital-blue-pale);
    border: 1px solid var(--digital-blue-pale);
    background-color: 1px solid var(--digital-blue-pale);
}

.button--medium.button--pale {
    color: var(--digital-blue-pale);
    border: 1px solid var(--digital-blue-pale);
}

.button--low.button--pale {
    color: var(--digital-blue-pale);

}

</style>

<button class="button--{level} button--{size} button-text--{size} button--{paleness}" class:dark on:click>
    <slot></slot>
</button>
