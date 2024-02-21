# PWA Web App

This is a example Persistent (PWA) Web App for the Cisco Room Navigator.

![screenshot](/images/screenshot.png)

## Overview

The Web App leverages the built in JavaScript xAPI access when loaded on a Room Navigator running in PWA mode. With this, the Web App obtains the name of the Workspace in which the Navigator belows and displays it on the top of the Web App.

Additionally, the Web App subscribes to the Room Analytics sensors of the in room device and displays live People Count, Temperature and Ambient Noise levels.


## Setup

### Prerequisites & Dependencies: 

- Cisco Room Navigator ( Either Wall Mount or Table Stand version )
- Control Hub Admin or Device Web admin access to the device to set the Kiosk URL
- Network connectivity so your Webex Device open access Web App hosted on the GitHub pages domain (*.github.io)

### Setup Steps:

1. Log into the Persistant Web App URL for your Room Navigator to:
```
https://wxsd-sales.github.io/pwa-webapp/
```
    
## Demo

*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).

## License
<!-- MAKE SURE an MIT license is included in your Repository. If another license is needed, verify with management. This is for legal reasons.--> 

<!-- Keep the following statement -->
All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer
<!-- Keep the following here -->  
Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex usecases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=pwa-webapp) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
