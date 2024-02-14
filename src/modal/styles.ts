import { css } from 'lit';

export const modalDialogStyles = css`
  .dialog-modal {
    position: fixed;
    z-index: 99;
    font-family: 'Open Sans', arial, sans-serif;
    margin: 0 auto;
    padding: 0;
    width: 100%;
    border-radius: 1rem 1rem 0 0;
    border-width: 0;
    box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.25);
    bottom: 0;
    overflow: hidden;
  }

  @media screen and (min-width: 768px) {
    .dialog-modal {
      position: fixed;
      z-index: 99;
      font-family: 'Open Sans', arial, sans-serif;
      margin: 0 auto;
      padding: 1rem;
      width: 100%;
      max-width: 320px;
      border-radius: 1rem;
      border-width: 0;
      background: #1a1c20;
      color: #fafafa;
      box-shadow: 0 0.125rem 0.75rem rgba(0, 0, 0, 0.25);
      top: 3rem;
    }
  }
`;

export const modalDialogBodyStyles = css`
  .dialog-modal-body {
    display: flex;
    flex-direction: column;
  }

  .dialog-modal-body__help,
  .dialog-modal-body__wallets {
    width: 100%;
    flex-basis: 100%;
  }

  .dialog-modal-body__help {
    order: 2;
    padding: 1rem;
  }

  .dialog-modal-body__wallets {
    order: 1;
    padding: 2rem 1.5rem 1rem 1.5rem;
  }

  .dialog-text-solid {
    font-size: 1.25rem;
  }

  .dialog-text {
    font-size: 1rem;
  }

  @media (prefers-color-scheme: light) {
    .dialog-modal-body__help {
      background-color: #f8f8f8;
      border-top: 1px solid rgba(0, 0, 0, 0.15);
    }

    .dialog-modal-body__wallets,
    .dialog-modal-body {
      background-color: #fcfcfc;
    }

    .dialog-text-solid {
      color: #000000;
    }

    .dialog-text {
      color: #181818;
    }
  }

  @media (prefers-color-scheme: dark) {
    .dialog-modal-body__help {
      background-color: #1c1c1c;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
    }

    .dialog-modal-body__wallets,
    .dialog-modal-body {
      background-color: #161616;
    }

    .dialog-text-solid {
      color: #ededed;
    }

    .dialog-text {
      color: #a0a0a0;
    }
  }
`;

export const modalHelpSection = css`
  .help-container {
    width: 100%;
  }

  .help__title,
  .help__text {
    text-align: center;
  }

  .help__text {
    max-width: 30rem;
    margin-left: auto;
    margin-right: auto;
  }
`;

export const modalWalletsSection = css`
  .wallets-container {
    width: 100%;
    height: 100%;
    min-height: fit-content;
    display: flex;
    flex-direction: column;
  }

  .wallets-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .wallets-header__modal-title {
    font-size: 1.25rem;
    padding: 0;
    margin: 0;
  }

  .wallets-header__button {
    background: none;
    border: none;
    cursor: pointer;
  }

  @media (prefers-color-scheme: light) {
    .wallets-header__button svg {
      fill: #8f8f8f;
    }
  }

  @media (prefers-color-scheme: dark) {
    .wallets-header__button svg {
      fill: #707070;
    }
  }

  .wallets-body {
    width: 100%;
    list-style: none;
    padding: 0 !important;
  }

  .wallets-body__item {
    display: flex;
    align-items: center;
    font-size: 1.125rem;
    font-weight: 600;
    padding-top: 1rem;
    padding-bottom: 1rem;
    cursor: pointer;
  }

  .wallets-body__item img {
    margin-right: 1rem;
    width: 35px;
  }

  .wallets-body__item.not-available {
    cursor: not-allowed;
  }

  .wallets-body__item .not-available {
    margin-left: auto;
    font-size: 10px;
    padding: 0.25rem 0.5rem;
    border-radius: 1rem;
  }

  @media (prefers-color-scheme: light) {
    .wallets-body__item .not-available {
      border: solid #e2e2e2 1px;
      background-color: #f3f3f3;
      color: #6f6f6f;
    }
  }

  @media (prefers-color-scheme: dark) {
    .wallets-body__item .not-available {
      border: solid #343434 1px;
      background-color: #232323;
      color: #a0a0a0;
    }
  }

  @media screen and (min-width: 768px) {
    .wallets-container {
      width: 100%;
      height: 100%;
      min-height: fit-content;
      display: flex;
      flex-direction: column;
    }

    .wallets-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .wallets-header__modal-title {
      font-size: 1.25rem;
      padding: 0;
      margin: 0;
    }

    .wallets-header__button {
      background: none;
      padding: 0.25rem 0.5rem;
      color: inherit;
      border-image: none;
      border-style: solid;
      border-color: rgba(inherit, 0.5);
      border-width: 0.1rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .wallets-body {
      width: 100%;
      list-style: none;
      padding: 0 !important;
    }

    .wallets-body__item {
      display: flex;
      align-items: center;
      font-size: 1.125rem;
      font-weight: 600;
      padding-top: 1rem;
      padding-bottom: 1rem;
      cursor: pointer;
    }

    .wallets-body__item.not-available {
      cursor: not-allowed;
    }

    .wallets-body__item img {
      margin-right: 1rem;
      width: 35px;
    }

    .wallets-body__item .not-available {
      margin-left: auto;
      font-size: 10px;
      border: solid red 1px;
      padding: 0.25rem 0.5rem;
      border-radius: 1rem;
    }

    .wallets-footer {
      margin-top: auto;
      width: 100%;
      text-align: center;
      font-size: 0.75rem;
      opacity: 0.75;
      padding: 0.75rem 1rem 0;
      border-top: rgba(255, 255, 255, 0.25) 1px solid;
    }
  }
`;

export const backdropStyles = css`
  .dialog-modal[open] + .backdrop {
    background: rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export const modalOpenAnimation = css`
  .dialog-modal[open] {
    -webkit-animation: showModal 0.3s ease normal;
  }
  @-webkit-keyframes showModal {
    from {
      transform: translateY(25%);
      opacity: 0;
    }
    to {
      transform: translateY(0%);
      opacity: 1;
    }
  }
`;
