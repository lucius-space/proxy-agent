## O-AUTH Up-42

Simple code to keep an active connection with the UP42 API set.

### Running:

- Set environment variable: `echo UP42_USERNAME=your_up42_login_email_address`
- Set environment variable: `echo UP42_PASSWORD=your_up42_login_password`
- `npm run dev`

### Information:

This code will not stop running until it is shut down. Will keep refreshing your access token to the Up-42 API set by generating a new access token every 5 minutes.
