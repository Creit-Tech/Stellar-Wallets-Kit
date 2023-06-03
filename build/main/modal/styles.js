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
    min-height: 360px;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL3N0eWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBRTFCLE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FpQm5DLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFBOzs7Ozs7OztDQVFoQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7OztDQWNwQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTRFOUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ2xpdCc7XG5cbmV4cG9ydCBjb25zdCBtb2RhbERpYWxvZ1N0eWxlcyA9IGNzc2BcbiAgLmRpYWxvZy1tb2RhbCB7XG4gICAgcG9zaXRpb246IGZpeGVkO1xuICAgIHotaW5kZXg6IDk5O1xuICAgIGZvbnQtZmFtaWx5OiAnT3BlbiBTYW5zJywgYXJpYWwsIHNhbnMtc2VyaWY7XG4gICAgbWFyZ2luOiAwIGF1dG87XG4gICAgcGFkZGluZzogMXJlbTtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBtYXgtd2lkdGg6IDMyMHB4O1xuICAgIG1pbi1oZWlnaHQ6IDM2MHB4O1xuICAgIGJvcmRlci1yYWRpdXM6IDFyZW07XG4gICAgYm9yZGVyLXdpZHRoOiAwO1xuICAgIGJhY2tncm91bmQ6ICMxQTFDMjA7XG4gICAgY29sb3I6ICNGQUZBRkE7XG4gICAgYm94LXNoYWRvdzogMCAuMTI1cmVtIC43NXJlbSByZ2JhKDAsIDAsIDAsIC4yNSk7XG4gICAgdG9wOiAzcmVtO1xuICB9XG5gO1xuXG5leHBvcnQgY29uc3QgYmFja2Ryb3BTdHlsZXMgPSBjc3NgXG4gIC5kaWFsb2ctbW9kYWxbb3Blbl0gKyAuYmFja2Ryb3Age1xuICAgIGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgLjUpO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMTAwJTtcbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IG1vZGFsT3BlbkFuaW1hdGlvbiA9IGNzc2BcbiAgLmRpYWxvZy1tb2RhbFtvcGVuXSB7XG4gICAgLXdlYmtpdC1hbmltYXRpb246IHNob3dNb2RhbCAuM3MgZWFzZSBub3JtYWw7XG4gIH1cbiAgQC13ZWJraXQta2V5ZnJhbWVzIHNob3dNb2RhbCB7XG4gICAgZnJvbSB7XG4gICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMjUlKTtcbiAgICAgIG9wYWNpdHk6IDA7XG4gICAgfVxuICAgIHRvIHtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwJSk7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgIH1cbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IGxheW91dFN0eWxlcyA9IGNzc2BcbiAgLmxheW91dCB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgfVxuXG4gIC5sYXlvdXQtaGVhZGVyIHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICB9XG5cbiAgLmxheW91dC1oZWFkZXJfX21vZGFsLXRpdGxlIHtcbiAgICBmb250LXNpemU6IDEuMjVyZW07XG4gICAgcGFkZGluZzogMDtcbiAgICBtYXJnaW46IDA7XG4gIH1cblxuICAubGF5b3V0LWhlYWRlcl9fYnV0dG9uIHtcbiAgICBiYWNrZ3JvdW5kOiBub25lO1xuICAgIHBhZGRpbmc6IC4yNXJlbSAuNXJlbTtcbiAgICBjb2xvcjogaW5oZXJpdDtcbiAgICBib3JkZXItaW1hZ2U6IG5vbmU7XG4gICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICBib3JkZXItY29sb3I6IHJnYmEoaW5oZXJpdCwgMC41KTtcbiAgICBib3JkZXItd2lkdGg6IC4xcmVtO1xuICAgIGJvcmRlci1yYWRpdXM6IDFyZW07XG4gICAgZm9udC1zaXplOiAuNzVyZW07XG4gICAgY3Vyc29yOiBwb2ludGVyO1xuICB9XG5cbiAgLmxheW91dC1ib2R5IHtcbiAgICB3aWR0aDogMTAwJTtcbiAgICBsaXN0LXN0eWxlOiBub25lO1xuICAgIHBhZGRpbmc6IDAgIWltcG9ydGFudDtcbiAgfVxuXG4gIC5sYXlvdXQtYm9keV9faXRlbSB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgIGZvbnQtc2l6ZTogMS4xMjVyZW07XG4gICAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgICBwYWRkaW5nLXRvcDogMXJlbTtcbiAgICBwYWRkaW5nLWJvdHRvbTogMXJlbTtcbiAgICBjdXJzb3I6IHBvaW50ZXI7XG4gIH1cblxuICAubGF5b3V0LWJvZHlfX2l0ZW0ubm90LWF2YWlsYWJsZSB7XG4gICAgY3Vyc29yOiBub3QtYWxsb3dlZDtcbiAgfVxuXG4gIC5sYXlvdXQtYm9keV9faXRlbSBpbWcge1xuICAgIG1hcmdpbi1yaWdodDogMXJlbTtcbiAgICB3aWR0aDogMzVweDtcbiAgfVxuXG4gIC5sYXlvdXQtYm9keV9faXRlbSAubm90LWF2YWlsYWJsZSB7XG4gICAgbWFyZ2luLWxlZnQ6IGF1dG87XG4gICAgZm9udC1zaXplOiAxMHB4O1xuICAgIGJvcmRlcjogc29saWQgcmVkIDFweDtcbiAgICBwYWRkaW5nOiAuMjVyZW0gLjVyZW07XG4gICAgYm9yZGVyLXJhZGl1czogMXJlbTtcbiAgfVxuXG4gIC5sYXlvdXQtZm9vdGVyIHtcbiAgICBtYXJnaW4tdG9wOiBhdXRvO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICBmb250LXNpemU6IC43NXJlbTtcbiAgICBvcGFjaXR5OiAuNzU7XG4gICAgcGFkZGluZzogLjc1cmVtIDFyZW0gMDtcbiAgICBib3JkZXItdG9wOiByZ2JhKDI1NSwgMjU1LCAyNTUsIC4yNSkgMXB4IHNvbGlkO1xuICB9XG5gO1xuIl19