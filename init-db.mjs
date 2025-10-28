import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'transputec_dispatch',
  multipleStatements: true
});

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  name TEXT NOT NULL,
  role ENUM('super_admin', 'admin') DEFAULT 'admin' NOT NULL,
  isActive INT DEFAULT 1 NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastLogin TIMESTAMP NULL,
  createdBy INT
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobToken VARCHAR(64) NOT NULL UNIQUE,
  siteName VARCHAR(255) NOT NULL,
  siteId VARCHAR(100),
  siteLocation VARCHAR(255),
  siteAddress TEXT,
  siteLatitude VARCHAR(50),
  siteLongitude VARCHAR(50),
  siteContactName VARCHAR(255),
  siteContactNumber VARCHAR(50),
  changeNumber VARCHAR(100),
  incidentNumber VARCHAR(100),
  projectName VARCHAR(255),
  downTime BOOLEAN DEFAULT FALSE,
  scheduledDateTime TIMESTAMP NULL,
  hoursRequired VARCHAR(100),
  toolsRequired TEXT,
  deviceDetails TEXT,
  incidentDetails TEXT,
  scopeOfWork TEXT,
  coveredByCOI BOOLEAN DEFAULT TRUE,
  notes TEXT,
  status ENUM('pending_approval', 'approved', 'rejected', 'created', 'sent_to_engineer', 'accepted', 'declined', 'en_route', 'on_site', 'completed', 'cancelled') DEFAULT 'pending_approval' NOT NULL,
  engineerName VARCHAR(255),
  engineerEmail VARCHAR(320),
  engineerPhone VARCHAR(50),
  acceptedAt TIMESTAMP NULL,
  enRouteAt TIMESTAMP NULL,
  arrivedAt TIMESTAMP NULL,
  completedAt TIMESTAMP NULL,
  clientName VARCHAR(255) NOT NULL,
  clientEmail VARCHAR(320),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  createdBy INT,
  FOREIGN KEY (createdBy) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS jobLocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobId INT NOT NULL,
  latitude VARCHAR(50) NOT NULL,
  longitude VARCHAR(50) NOT NULL,
  accuracy VARCHAR(50),
  trackingType ENUM('en_route', 'on_site') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (jobId) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS jobStatusHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobId INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  latitude VARCHAR(50),
  longitude VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (jobId) REFERENCES jobs(id)
);

CREATE TABLE IF NOT EXISTS siteVisitReports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jobId INT NOT NULL UNIQUE,
  visitDate TIMESTAMP NOT NULL,
  ticketNumbers TEXT,
  engineerName VARCHAR(255) NOT NULL,
  onsiteContact VARCHAR(255),
  timeOnsite VARCHAR(50),
  timeLeftSite VARCHAR(50),
  issueFault TEXT,
  actionsPerformed TEXT,
  issueResolved BOOLEAN DEFAULT FALSE,
  contactAgreed BOOLEAN DEFAULT FALSE,
  clientSignatory VARCHAR(255),
  clientSignatureData TEXT,
  signedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (jobId) REFERENCES jobs(id)
);
`;

await connection.query(schema);
console.log('✅ Database tables created successfully');
await connection.end();
