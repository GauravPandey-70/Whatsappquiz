function recommendSystem(answers) {
  const budget = answers.get('q2');
  const size = answers.get('q1');
  const tech = answers.get('q3');
  const concern = answers.get('q4');
  const entries = answers.get('q5');
  const pets = answers.get('q6');

  // Product catalog with images
  const products = {
    basicLock: {
      name: "Basic Lock",
      price: "₹999",
      desc: "Simple door lock for small homes.",
      image: "https://i.postimg.cc/fyMFtBYb/download.jpg",
      link: "https://amzn.to/basic-lock"
    },
    smartSystem: {
      name: "Full Smart System",
      price: "₹4,999",
      desc: "Cameras, sensors, and app control (pet-friendly).",
      image: "https://i.postimg.cc/NMZXqpRF/Wired-alarm-kit.webp",
      link: "https://amzn.to/full-smart-system"
    },
    doorbellCam: {
      name: "Doorbell Cam Pro",
      price: "₹2,499",
      desc: "Motion detection for multiple entries.",
      image: "https://i.postimg.cc/Zq2nC0nD/doorbell-cam-pro.webp",
      link: "https://amzn.to/doorbell-cam"
    },
    wiredAlarm: {
      name: "Wired Alarm Kit",
      price: "₹1,299",
      desc: "No apps, reliable wired burglary alarm.",
      image: "https://i.postimg.cc/mZ0j5dP1/wireless-2f-wired-home-security-alarm-system-500x500.webp",
      link: "https://amzn.to/wired-alarm"
    }
  };

  let rec = products.basicLock; // default

  if (budget === 'high' && size === 'large') {
    rec = products.smartSystem;
  } else if (concern === 'outdoor' && entries === 'many') {
    rec = products.doorbellCam;
  } else if (tech === 'low') {
    rec = products.wiredAlarm;
  }

  return rec;
}

module.exports = recommendSystem;
