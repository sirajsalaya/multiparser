import express from 'express';
import multipartBody from 'multipartbody';

const app = express();

// Example form-data keys:
// profile.name=alice
// profile.avatar=@/path/to/avatar.png
app.post('/upload', multipartBody(), (req, res) => {
  res.json({
    profileName: req.body.profile?.name,
    profileAvatar: req.body.profile?.avatar,
    fullBody: req.body,
  });
});

app.listen(3000, () => {
  console.log('Multer migration example listening on http://localhost:3000');
});
