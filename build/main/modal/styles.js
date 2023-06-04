import { css } from 'lit';
export const modalDialogStyles = css `
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
    background: #1A1C20;
    color: #FAFAFA;
    box-shadow: 0 .125rem .75rem rgba(0, 0, 0, .25);
    top: 3rem;
  }
`;
export const backdropStyles = css `
  .dialog-modal[open] + .backdrop {
    background: rgba(0, 0, 0, .5);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;
export const modalOpenAnimation = css `
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
export const layoutStyles = css `
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL3N0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRTFCLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztDQWdCbkMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUE7Ozs7Ozs7O0NBUWhDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7O0NBY3BDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEU5QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3NzIH0gZnJvbSAnbGl0JztcblxuZXhwb3J0IGNvbnN0IG1vZGFsRGlhbG9nU3R5bGVzID0gY3NzYFxuICAuZGlhbG9nLW1vZGFsIHtcbiAgICBwb3NpdGlvbjogZml4ZWQ7XG4gICAgei1pbmRleDogOTk7XG4gICAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCBhcmlhbCwgc2Fucy1zZXJpZjtcbiAgICBtYXJnaW46IDAgYXV0bztcbiAgICBwYWRkaW5nOiAxcmVtO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG1heC13aWR0aDogMzIwcHg7XG4gICAgYm9yZGVyLXJhZGl1czogMXJlbTtcbiAgICBib3JkZXItd2lkdGg6IDA7XG4gICAgYmFja2dyb3VuZDogIzFBMUMyMDtcbiAgICBjb2xvcjogI0ZBRkFGQTtcbiAgICBib3gtc2hhZG93OiAwIC4xMjVyZW0gLjc1cmVtIHJnYmEoMCwgMCwgMCwgLjI1KTtcbiAgICB0b3A6IDNyZW07XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBiYWNrZHJvcFN0eWxlcyA9IGNzc2BcbiAgLmRpYWxvZy1tb2RhbFtvcGVuXSArIC5iYWNrZHJvcCB7XG4gICAgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAuNSk7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgbW9kYWxPcGVuQW5pbWF0aW9uID0gY3NzYFxuICAuZGlhbG9nLW1vZGFsW29wZW5dIHtcbiAgICAtd2Via2l0LWFuaW1hdGlvbjogc2hvd01vZGFsIC4zcyBlYXNlIG5vcm1hbDtcbiAgfVxuICBALXdlYmtpdC1rZXlmcmFtZXMgc2hvd01vZGFsIHtcbiAgICBmcm9tIHtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgyNSUpO1xuICAgICAgb3BhY2l0eTogMDtcbiAgICB9XG4gICAgdG8ge1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDAlKTtcbiAgICAgIG9wYWNpdHk6IDE7XG4gICAgfVxuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgbGF5b3V0U3R5bGVzID0gY3NzYFxuICAubGF5b3V0IHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICB9XG5cbiAgLmxheW91dC1oZWFkZXIge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIH1cblxuICAubGF5b3V0LWhlYWRlcl9fbW9kYWwtdGl0bGUge1xuICAgIGZvbnQtc2l6ZTogMS4yNXJlbTtcbiAgICBwYWRkaW5nOiAwO1xuICAgIG1hcmdpbjogMDtcbiAgfVxuXG4gIC5sYXlvdXQtaGVhZGVyX19idXR0b24ge1xuICAgIGJhY2tncm91bmQ6IG5vbmU7XG4gICAgcGFkZGluZzogLjI1cmVtIC41cmVtO1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICAgIGJvcmRlci1pbWFnZTogbm9uZTtcbiAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICAgIGJvcmRlci1jb2xvcjogcmdiYShpbmhlcml0LCAwLjUpO1xuICAgIGJvcmRlci13aWR0aDogLjFyZW07XG4gICAgYm9yZGVyLXJhZGl1czogMXJlbTtcbiAgICBmb250LXNpemU6IC43NXJlbTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gIH1cblxuICAubGF5b3V0LWJvZHkge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG4gICAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICB9XG5cbiAgLmxheW91dC1ib2R5X19pdGVtIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgZm9udC1zaXplOiAxLjEyNXJlbTtcbiAgICBmb250LXdlaWdodDogNjAwO1xuICAgIHBhZGRpbmctdG9wOiAxcmVtO1xuICAgIHBhZGRpbmctYm90dG9tOiAxcmVtO1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgfVxuXG4gIC5sYXlvdXQtYm9keV9faXRlbS5ub3QtYXZhaWxhYmxlIHtcbiAgICBjdXJzb3I6IG5vdC1hbGxvd2VkO1xuICB9XG5cbiAgLmxheW91dC1ib2R5X19pdGVtIGltZyB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxcmVtO1xuICAgIHdpZHRoOiAzNXB4O1xuICB9XG5cbiAgLmxheW91dC1ib2R5X19pdGVtIC5ub3QtYXZhaWxhYmxlIHtcbiAgICBtYXJnaW4tbGVmdDogYXV0bztcbiAgICBmb250LXNpemU6IDEwcHg7XG4gICAgYm9yZGVyOiBzb2xpZCByZWQgMXB4O1xuICAgIHBhZGRpbmc6IC4yNXJlbSAuNXJlbTtcbiAgICBib3JkZXItcmFkaXVzOiAxcmVtO1xuICB9XG5cbiAgLmxheW91dC1mb290ZXIge1xuICAgIG1hcmdpbi10b3A6IGF1dG87XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgdGV4dC1hbGlnbjogY2VudGVyO1xuICAgIGZvbnQtc2l6ZTogLjc1cmVtO1xuICAgIG9wYWNpdHk6IC43NTtcbiAgICBwYWRkaW5nOiAuNzVyZW0gMXJlbSAwO1xuICAgIGJvcmRlci10b3A6IHJnYmEoMjU1LCAyNTUsIDI1NSwgLjI1KSAxcHggc29saWQ7XG4gIH1cbmA7XG4iXX0=