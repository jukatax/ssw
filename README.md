# SSW - Statistical Significance Widget
Creating this widget for Optimisation Managers to calculate statistical significance for their AB tests directly in Analytics with few clicks only.
The widget was created to help them quickly calculate significance for metrics from AB tests in Adobe Omniture.
Update the @include values to match the domain you wnat to use it if different from Adobe Omniture.

## How to install
Create a new bookmark, go end edit it, paste the contents of bookmarklet.txt in the URL field
copy and paste the code from t-test_widget.js into a new script in Tampermonkey.

## How to use
Go to the webpage where your analytics dashboards are. Open a dashboard with results of an AB test.
Click on the bookmark you created earlier.
The widget will appear.

### Input values
Highlidhted input field in the widget is the input where the value will be assigned
To assign a value simply click on a number cell on the Analytics page you are on.
Select next input field in the widget and repeat the process so that all input fields are filled in.
The calculated statistical significance will appear below the input fields.

Input fields can be filled in manually as well.

### Move the widget 
Click on the top position values - "left center right" to align the widget where you prefer.
Last value is remembered by using a cookie that expires in 30 days after last use of the position buttons.

### Hide/Show toglle
Cmnd/Win + Shift + Y
