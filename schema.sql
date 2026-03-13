-- Hospital Management App MVP Database Schema

-- Doctors Table
CREATE TABLE Doctors (
    DoctorID INT PRIMARY KEY AUTO_INCREMENT,
    docId VARCHAR(20) UNIQUE, -- Auto-generated or custom ID for login
    Name VARCHAR(100) NOT NULL,
    Specialty VARCHAR(100) NOT NULL,
    Education VARCHAR(255),
    Skills TEXT,
    RoomNumber VARCHAR(10),
    Schedule VARCHAR(255), -- E.g., 'Mon-Fri, 9AM-5PM'
    IsActive BOOLEAN DEFAULT TRUE -- Manager can toggle this to remove from booking list
);

-- Patients Table
CREATE TABLE Patients (
    PatientID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(15)
);

-- Appointments Table
CREATE TABLE Appointments (
    AppointmentID INT PRIMARY KEY AUTO_INCREMENT,
    DoctorID INT,
    PatientID INT,
    AppointmentDate DATE NOT NULL,
    TimeSlot VARCHAR(20) NOT NULL,
    Status ENUM('Pending', 'Accepted', 'ChangeRequested', 'Rescheduled', 'Completed') DEFAULT 'Pending',
    Symptom VARCHAR(100), -- E.g., 'Chest Pain', 'Fever'
    TriageDetails TEXT, -- Stores JSON string of dynamic follow-up answers
    QuickBrief TEXT, -- Auto-generated summary for the doctor
    WaitTime INT DEFAULT 0, -- Estimated wait time in minutes
    FOREIGN KEY (DoctorID) REFERENCES Doctors(DoctorID) ON DELETE CASCADE,
    FOREIGN KEY (PatientID) REFERENCES Patients(PatientID) ON DELETE CASCADE
);

-- Triage Questions Table
CREATE TABLE TriageQuestions (
    QuestionID INT PRIMARY KEY AUTO_INCREMENT,
    QuestionText VARCHAR(255) NOT NULL,
    InputType ENUM('Text', 'Number', 'Select', 'Boolean') DEFAULT 'Text',
    Options TEXT, -- JSON array of options if InputType is 'Select'
    IsActive BOOLEAN DEFAULT TRUE
);

-- Sample Data Insertion
INSERT INTO Doctors (Name, Education, Skills, RoomNumber, Schedule) VALUES
('Dr. Alice Smith', 'MD, Cardiology', 'Heart Surgery, ECG', '101A', 'Mon-Thu 9AM-4PM'),
('Dr. Bob Jones', 'MBBS, Pediatrics', 'Child Care, Vaccinations', '205B', 'Tue-Sat 10AM-6PM'),
('Dr. Carol White', 'MD, Neurology', 'Brain Disorders, Spinal Health', '302C', 'Mon, Wed, Fri 8AM-2PM');

INSERT INTO Patients (Name, Email, Phone) VALUES
('John Doe', 'john.doe@email.com', '555-0100'),
('Jane Roe', 'jane.roe@email.com', '555-0101');

INSERT INTO Appointments (DoctorID, PatientID, AppointmentDate, TimeSlot, Status) VALUES
(1, 1, '2023-11-15', '10:00 AM', 'Pending'),
(2, 2, '2023-11-16', '11:30 AM', 'Accepted');
