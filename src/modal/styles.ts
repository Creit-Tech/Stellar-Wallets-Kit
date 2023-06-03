import { css } from 'lit';

export const modalDialogStyles = css`
  .dialog-modal {
    position: fixed;
    z-index: 99;
    font-family: 'Open Sans', arial, sans-serif;
    margin: 0 auto;
    padding: 1rem;
    width: 100%;
    max-width: 320px;
    min-height: 360px;
    border-radius: 1rem;
    border-width: 0;
    background: #1A1C20;
    color: #FAFAFA;
    box-shadow: 0 .125rem .75rem rgba(0, 0, 0, .25);
    top: 3rem;
  }
`;

export const backdropStyles = css`
  .dialog-modal[open] + .backdrop {
    background: rgba(0, 0, 0, .5);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

export const modalOpenAnimation = css`
  .dialog-modal[open] {
    -webkit-animation: showModal .3s ease normal;
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

export const layoutStyles = css`
  .layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .layout-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .layout-header__modal-title {
    font-size: 1.25rem;
    padding: 0;
    margin: 0;
  }

  .layout-header__button {
    background: none;
    padding: .25rem .5rem;
    color: inherit;
    border-image: none;
    border-style: solid;
    border-color: rgba(inherit, 0.5);
    border-width: .1rem;
    border-radius: 1rem;
    font-size: .75rem;
    cursor: pointer;
  }

  .layout-body {
    width: 100%;
    list-style: none;
    padding: 0 !important;
  }

  .layout-body__item {
    display: flex;
    align-items: center;
    font-size: 1.125rem;
    font-weight: 600;
    padding-top: 1rem;
    padding-bottom: 1rem;
    cursor: pointer;
  }

  .layout-body__item.not-available {
    cursor: not-allowed;
  }

  .layout-body__item img {
    margin-right: 1rem;
    width: 35px;
  }

  .layout-body__item .not-available {
    margin-left: auto;
    font-size: 10px;
    border: solid red 1px;
    padding: .25rem .5rem;
    border-radius: 1rem;
  }

  .layout-footer {
    margin-top: auto;
    width: 100%;
    text-align: center;
    font-size: .75rem;
    opacity: .75;
    padding: .75rem 1rem 0;
    border-top: rgba(255, 255, 255, .25) 1px solid;
  }
`;
