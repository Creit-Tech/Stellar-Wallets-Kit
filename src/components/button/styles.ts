import { css } from 'lit';

export const buttonContainer = css`
  .btn-container {
    position: relative;
  }
`;

export const buttonStyles = css`
  .btn {
    background: none;
    border: none;
    border-radius: var(--button-border-radius, 0.5rem);
    cursor: pointer;
    padding: var(--button-padding, 0.5rem 1.25rem);
    display: flex;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items: center;
    line-height: 100%;
    margin: 0;
    font-family: 'Open Sans', arial, sans-serif;
  }

  .btn svg {
    width: 1rem;
    height: auto;
    margin-left: 0.5rem;
  }

  @media (prefers-color-scheme: light) {
    .btn {
      background-color: var(--button-bg-color, #fcfcfc);
      color: var(--button-text-color, #181818);
      border: solid var(--button-text-color, #181818) 1px;
    }

    .btn svg circle,
    .btn svg path {
      stroke: var(--button-text-color, #181818);
    }
  }

  @media (prefers-color-scheme: dark) {
    .btn {
      background-color: var(--button-bg-color, #161616);
      color: var(--button-text-color, #fcfcfc);
      border: solid var(--button-text-color, #fcfcfc) 1px;
    }

    .btn svg circle,
    .btn svg path {
      stroke: var(--button-text-color, #fcfcfc);
    }
  }
`;

export const dropdownWrapper = css`
  .dropdown-wrapper {
    position: absolute;
    top: 110%;
    right: 0;
    box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.25);
    z-index: 900;
    border-radius: 0.75rem;
    padding: 2rem;
    width: 18rem;
    display: flex;
    flex-direction: column;
    font-family: 'Open Sans', arial, sans-serif;
  }

  .dropdown-profile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 2rem;
  }

  .dropdown-text-solid {
    font-size: 1rem;
    line-height: 1.25rem;
  }

  .dropdown-text {
    font-size: 0.875rem;
    line-height: 1.125rem;
  }

  .dropdown-action-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .dropdown-action-button {
    padding: 0.4rem;
    border-radius: 0.25rem;
    border: none;
    background: none;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .dropdown-close {
    position: absolute;
    right: 1rem;
    top: 1rem;
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
  }

  @media (prefers-color-scheme: light) {
    .dropdown-wrapper {
      background-color: var(--button-bg-color, #fcfcfc);
      border: solid 1px var(--button-solid-text-color, #000000);
    }

    .dropdown-text-solid,
    .dropdown-action-button,
    .dropdown-close {
      color: var(--button-solid-text-color, #000000);
    }

    .dropdown-text {
      color: var(--button-text-color, #181818);
    }

    svg circle,
    svg path {
      stroke: var(--button-text-color, #181818);
    }

    .dropdown-action-button {
      border: 1px solid var(--button-text-color, #181818);
    }
  }

  @media (prefers-color-scheme: dark) {
    .dropdown-wrapper {
      background-color: var(--button-bg-color, #161616);
      border: solid 1px var(--button-solid-text-color, #ededed);
    }

    .dropdown-text-solid,
    .dropdown-action-button,
    .dropdown-close {
      color: var(--button-solid-text-color, #ededed);
    }

    .dropdown-text {
      color: var(--button-text-color, #a0a0a0);
    }

    svg circle,
    svg path {
      stroke: var(--button-text-color, #fcfcfc);
    }

    .dropdown-action-button {
      border: 1px solid var(--button-text-color, #a0a0a0);
    }
  }
`;
