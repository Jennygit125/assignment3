const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

require('dotenv').config();
const app = express();
app.use(morgan('dev'));
app.use(express.json());
const port = process.env.PORT;
const dbUrl = process.env.MONGODB_URI;
// Connect to MongoDB
const dbConnect = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
dbConnect();

const studentSchema = new mongoose.Schema({
  Fullname: String,
  email: String,
  phoneNumber: String,
  skillCategory: String,
  gender: String,
  address: String,
  isVerified: Boolean,
  age: Number,
  grade: String,
});
const Student = mongoose.model('Student', studentSchema);
app.post('/providers', async (req,res) =>{
const { Fullname, email,phoneNumber, skillCategory,gender, address, isVerified, age, grade }= req.body;
try{
    if (!Fullname ||!email ||!phoneNumber ||!skillCategory ||!gender ||!address ||isVerified === undefined ||!age ||!grade) {
        return res.status(400).json({ error: 'All fields are required'});
    }

const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
  return res.status(409).json({
    error: 'Profile already exists with this email.'
  });
}
const newStudent = new Student({ Fullname, email,phoneNumber, skillCategory,gender, address, isVerified, age, grade});
    await newStudent.save();
    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error adding student:', error);
    return res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/providers', async (req, res) => {
  try {
    const students = await Student.find();
    return res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/providers/skill', async (req, res) => {
  const { skill } = req.query;
if (!skill) {
  return res.status(400).json({ error: 'Skill is required' });
}

  try {
    const students = await Student.find({
      skillCategory: skill
    });
    return res.status(200).json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } 
});
app.get('/providers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/providers/:id/verify', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    if (!student.isVerified) {
      return res.status(403).json({ error: 'Student is not verified' });
    }
    return res.status(200).json({ student });
  } catch (error) {
    console.error('Error verifying student:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/providers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, {$set:req.body},     { new: true, runValidators: true }
    );
       if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.delete('/providers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
     if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.listen(port, () => {console.log(`Server is running on http://localhost:${port}`);
});
