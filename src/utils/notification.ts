/* eslint-disable no-new */
const createNotification = (title: string, text: string) => {
  new Notification(title, {
    body: text,
  });
};

export default createNotification;
