import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Dimensions, 
  Switch,
  Share
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import { 
  Search, 
  MoreVertical, 
  ShieldAlert, 
  HeartPulse, 
  ShieldCheck, 
  UserPlus, 
  Upload, 
  Printer,
  X, 
  Save, 
  CheckCircle2, 
  Users, 
  AlertTriangle, 
  BarChart2, 
  Lightbulb, 
  ClipboardList, 
  Pencil, 
  AlertOctagon, 
  Calendar, 
  UserCheck, 
  UserX, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Eye, 
  Download, 
  Trash2,
  Lock,
  Smile
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://student-attendance-and-engagement.onrender.com/api';

function getUSATodayDateStr() {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
}

export default function StudentsScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive" | "present">("all");
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Add Form state (exactly matching website)
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastInitial, setNewLastInitial] = useState("");
  const [newRollNumber, setNewRollNumber] = useState("");
  const [newBloodGroup, setNewBloodGroup] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");
  const [newParentsName, setNewParentsName] = useState("");
  const [newParentsPhone, setNewParentsPhone] = useState("");
  const [newProfilePhoto, setNewProfilePhoto] = useState("");
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isUploadingConsent, setIsUploadingConsent] = useState(false);
  const [newParentConsent, setNewParentConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic class and section master list from server
  const [masterClassObjects, setMasterClassObjects] = useState<any[]>([]);
  const [masterClasses, setMasterClasses] = useState<string[]>([]);
  const [masterSections, setMasterSections] = useState<string[]>([]);

  // Detail Modal internal tab
  const [detailTab, setDetailTab] = useState<"timeline" | "edit" | "consent">("timeline");
  
  // Edit & Report Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isImportingCsv, setIsImportingCsv] = useState(false);
  
  // Edit Form state (bound to selectedStudent)
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastInitial, setEditLastInitial] = useState("");
  const [editClass, setEditClass] = useState("");
  const [editSection, setEditSection] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editParentsName, setEditParentsName] = useState("");
  const [editParentsPhone, setEditParentsPhone] = useState("");
  const [editProfilePhoto, setEditProfilePhoto] = useState("");
  const [isEditPhotoUploading, setIsEditPhotoUploading] = useState(false);
  const [editOtp, setEditOtp] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [editParentConsent, setEditParentConsent] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/settings/classes`)
      ]);
      
      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      }
      if (classesRes.ok) {
        const classData = await classesRes.json();
        const classesList = Array.isArray(classData) ? classData : (classData.classes || []);
        setClasses(classesList);
        
        // Parse classes and sections exactly like web
        const normalized = classesList.map((c: any) => {
          if (typeof c === 'string') {
            if (c.includes("-")) {
              const parts = c.split("-");
              return { name: parts[0].trim(), section: parts.slice(1).join("-").trim() };
            }
            return { name: c, section: "" };
          }
          if (c.section) return c;
          if (c.name && c.name.includes("-")) {
            const parts = c.name.split("-");
            return { ...c, name: parts[0].trim(), section: parts.slice(1).join("-").trim() };
          }
          return { ...c, section: "" };
        });
        setMasterClassObjects(normalized);

        const cList = new Set<string>();
        const sList = new Set<string>();
        normalized.forEach((c: any) => {
          if (c.name) cList.add(c.name);
          if (c.section) sList.add(c.section);
        });
        setMasterClasses(Array.from(cList));
        setMasterSections(Array.from(sList));
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadProfilePhoto = async (uri: string) => {
    setIsPhotoUploading(true);
    try {
      const formData = new FormData();
      const name = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(name);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append("file", {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name,
        type,
      } as any);
      formData.append("upload_preset", process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "students_unsigned");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmeu6hdwg"}/image/upload`, {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setNewProfilePhoto(data.secure_url);
        Alert.alert("Uploaded", "Photo uploaded successfully! 📸");
      } else {
        Alert.alert("Upload Failed", "Could not upload photo to Cloudinary.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Upload Error", "An error occurred while uploading the photo.");
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleConsentUpload = async () => {
    if (!selectedStudent) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsUploadingConsent(true);

      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
        name: asset.name || 'consent_doc',
        type: asset.mimeType || 'application/octet-stream',
      } as any);
      formData.append("upload_preset", process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "students_unsigned");

      const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmeu6hdwg"}/auto/upload`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData.secure_url) {
          // Update student status on backend
          const updated = {
            ...selectedStudent,
            parentStatus: "Approved",
            parentConsentUrl: cloudData.secure_url,
          };

          const updateRes = await fetch(`${API_URL}/students/${selectedStudent.rollNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          });

          if (updateRes.ok) {
            const freshStudent = await updateRes.json();
            setSelectedStudent(freshStudent);
            fetchData();
            Alert.alert("Success", "Consent paper saved! 📄");
          } else {
            Alert.alert("Error", "Failed to update consent status on server.");
          }
        }
      } else {
        Alert.alert("Upload Failed", "Could not upload document to Cloudinary.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Upload Error", "An error occurred while uploading the document.");
    } finally {
      setIsUploadingConsent(false);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      Alert.alert("No Data", "There are no students to export.");
      return;
    }

    // Define CSV Headers
    const headers = [
      "Roll Number",
      "First Name",
      "Last Initial",
      "Class",
      "Parents Name",
      "Parents Phone",
      "Blood Group",
      "Parent Consent Status",
      "Consent Document URL"
    ];

    // Map student records to CSV rows
    const rows = students.map(student => {
      const escapeField = (val: any) => {
        if (val === undefined || val === null) return "";
        const str = String(val);
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeField(student.rollNumber),
        escapeField(student.firstName),
        escapeField(student.lastInitial),
        escapeField(student.class_name),
        escapeField(student.parentsName),
        escapeField(student.parentsPhone),
        escapeField(student.bloodGroup),
        escapeField(student.parentStatus || "Pending"),
        escapeField(student.parentConsentUrl)
      ].join(",");
    });

    const csvString = [headers.join(","), ...rows].join("\n");

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "student_profiles_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error(err);
        Alert.alert("Export Error", "Failed to download CSV in browser.");
      }
    } else {
      try {
        Share.share({
          message: csvString,
          title: "Student Profiles CSV Export"
        });
      } catch (err) {
        console.error(err);
        Alert.alert("Export Error", "Failed to share CSV data.");
      }
    }
  };

  const handleCsvUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/comma-separated-values', 'text/csv', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      setIsImportingCsv(true);

      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
        name: asset.name || 'students.csv',
        type: asset.mimeType || 'text/csv',
      } as any);

      const res = await fetch(`${API_URL}/students/upload_csv`, {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.ok) {
        setIsCsvModalOpen(false);
        fetchData();
        Alert.alert("Success", "CSV imported! 📊");
      } else {
        const errText = await res.text();
        console.error(errText);
        Alert.alert("Import Failed", "Could not parse or import the CSV file.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Upload Error", "An error occurred while uploading the CSV file.");
    } finally {
      setIsImportingCsv(false);
    }
  };

  const handleAddStudent = async () => {
    if (!newFirstName.trim() || !newLastInitial.trim() || !newRollNumber.trim() || !newClass || !newSection) {
      Alert.alert("Missing Fields", "Please complete First Name, Last Initial, Roll Number, Class, and Section.");
      return;
    }
    
    setIsSubmitting(true);
    const payload = {
      firstName: newFirstName.trim(),
      lastInitial: newLastInitial.trim().toUpperCase(),
      rollNumber: newRollNumber.trim().toUpperCase(),
      class_name: `${newClass}-${newSection}`,
      parentsName: newParentsName.trim(),
      parentsPhone: newParentsPhone.trim(),
      bloodGroup: newBloodGroup.trim(),
      profilePhoto: newProfilePhoto || undefined
    };

    try {
      const res = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Success", `${newFirstName} has been enrolled successfully!`);
        setIsAddModalOpen(false);
        // Clear inputs
        setNewFirstName("");
        setNewLastInitial("");
        setNewRollNumber("");
        setNewBloodGroup("");
        setNewClass("");
        setNewSection("");
        setNewParentsName("");
        setNewParentsPhone("");
        setNewProfilePhoto("");
        // Refresh list
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Failed", err.message || "Failed to enroll student.");
      }
    } catch (e) {
      Alert.alert("Network Error", "Unable to contact the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetail = (student: any) => {
    setSelectedStudent(student);
    setEditFirstName(student.firstName);
    setEditLastInitial(student.lastInitial || "");
    
    // Parse class and section from class_name or class
    const rawClass = student.class_name || student.class || "";
    if (rawClass.includes("-")) {
      const parts = rawClass.split("-");
      setEditClass(parts[0].trim());
      setEditSection(parts.slice(1).join("-").trim());
    } else {
      setEditClass(rawClass);
      setEditSection("");
    }
    
    setEditBloodGroup(student.bloodGroup || "");
    setEditParentsName(student.parentsName || "");
    setEditParentsPhone(student.parentsPhone || "");
    setEditProfilePhoto(student.profilePhoto || "");
    
    setEditOtp(student.otp ? (typeof student.otp === 'object' ? student.otp.code : student.otp) : "");
    setEditStatus(student.status || "active");
    setEditParentConsent(student.parentConsent !== false);
    setIsDetailModalOpen(true);
  };

  const pickEditImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadEditProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadEditProfilePhoto = async (uri: string) => {
    setIsEditPhotoUploading(true);
    try {
      const formData = new FormData();
      const name = uri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(name);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      
      formData.append("file", {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name,
        type,
      } as any);
      formData.append("upload_preset", process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "students_unsigned");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dmeu6hdwg"}/image/upload`, {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setEditProfilePhoto(data.secure_url);
        Alert.alert("Uploaded", "Photo uploaded successfully! 📸");
      } else {
        Alert.alert("Upload Failed", "Could not upload photo to Cloudinary.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Upload Error", "An error occurred while uploading the photo.");
    } finally {
      setIsEditPhotoUploading(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!selectedStudent) return;
    if (!editFirstName.trim() || !editLastInitial.trim() || !editClass || !editSection) {
      Alert.alert("Missing Fields", "Please complete First Name, Last Initial, Class, and Section.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...selectedStudent,
      firstName: editFirstName.trim(),
      lastInitial: editLastInitial.trim().toUpperCase(),
      class_name: `${editClass}-${editSection}`,
      bloodGroup: editBloodGroup.trim(),
      parentsName: editParentsName.trim(),
      parentsPhone: editParentsPhone.trim(),
      profilePhoto: editProfilePhoto || undefined,
      otp: editOtp.trim(),
      status: editStatus,
      parentConsent: editParentConsent
    };

    try {
      const res = await fetch(`${API_URL}/students/${selectedStudent.rollNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert("Success", "Student records updated successfully!");
        setIsEditModalOpen(false);
        setIsDetailModalOpen(false);
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Failed", err.message || "Failed to update record.");
      }
    } catch (e) {
      Alert.alert("Network Error", "Unable to update student records.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    Alert.alert(
      "Confirm Deletion",
      `Are you absolutely sure you want to remove ${selectedStudent.firstName} ${selectedStudent.lastInitial}? This action is permanent.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Student", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/students/${selectedStudent.rollNumber}`, {
                method: 'DELETE'
              });
              if (res.ok) {
                Alert.alert("Removed", "Student profile has been deleted.");
                setIsDetailModalOpen(false);
                fetchData();
              } else {
                Alert.alert("Failed", "Failed to delete student records.");
              }
            } catch (e) {
              Alert.alert("Network Error", "Unable to delete student.");
            }
          }
        }
      ]
    );
  };

  const activeStudents = students.filter(s => s.status !== "inactive");
  const inactiveStudents = students.filter(s => s.status === "inactive");
  
  const getFilteredList = () => {
    let list = students;
    if (activeTab === "active") list = activeStudents;
    else if (activeTab === "inactive") list = inactiveStudents;
    else if (activeTab === "present") {
      list = students.filter(s => s.timeline?.some((e: any) => e.day === "Today" || e.date === getUSATodayDateStr()));
    }
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.firstName.toLowerCase().includes(q) || 
        s.rollNumber.toLowerCase().includes(q) ||
        (s.lastInitial && s.lastInitial.toLowerCase().includes(q))
      );
    }
    return list;
  };

  const filteredStudents = getFilteredList();

  const getMoodColor = (score: number) => {
    if (score >= 8) return '#22c55e'; // Green
    if (score >= 5) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const getMoodBg = (score: number) => {
    if (score >= 8) return '#f0fdf4';
    if (score >= 5) return '#fffbeb';
    return '#fef2f2';
  };

  const handlePrint = () => {
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank', 'width=1000,height=800');
      if (!printWindow) return;

      const rowsHtml = filteredStudents.map(s => {
        const sClass = s.status === 'inactive' ? 'status-inactive' : 'status-active';
        return `
          <tr>
            <td>
              <div class="student-name">${s.firstName} ${s.lastInitial || ''}</div>
              <div class="student-meta">Roll: ${s.rollNumber}</div>
            </td>
            <td style="font-weight: bold; color: #475569;">
              ${s.className || s.class_name || 'N/A'} - ${s.section || s.section_name || 'N/A'}
            </td>
            <td>
              <span class="status-tag ${sClass}">
                ${s.status || 'Active'}
              </span>
            </td>
            <td>
              <div class="meta-val">${s.parentsName || 'N/A'}</div>
              <div class="student-meta">${s.parentsPhone || 'N/A'}</div>
            </td>
            <td style="font-weight: bold; color: ${s.parentConsent ? '#16a34a' : '#64748b'};">
              ${s.parentConsent ? '✓ Granted' : '✗ Pending'}
            </td>
          </tr>
        `;
      }).join('');

      const emptyHtml = filteredStudents.length === 0 ? '<tr><td colspan="5" style="text-align:center; padding: 30px; font-weight:bold; color:#94a3b8;">No students found for this selection.</td></tr>' : '';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Student Directory Report</title>
            <style>
              @page { size: letter portrait; margin: 0.5in; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                padding: 0; 
                margin: 0; 
                color: #0f172a;
              }
              .container { padding: 20px; max-width: 100%; margin: 0 auto; }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                padding-bottom: 15px; 
                border-bottom: 2px solid #e2e8f0;
              }
              .header h2 { 
                margin: 0 0 10px 0; 
                font-size: 28px; 
                font-weight: 900; 
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .header p { 
                margin: 0; 
                color: #64748b; 
                font-size: 14px; 
                font-weight: bold;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
              }
              th { 
                background: #f8fafc; 
                padding: 12px; 
                text-align: left; 
                font-size: 12px; 
                text-transform: uppercase; 
                font-weight: 900; 
                color: #475569; 
                border: 1px solid #cbd5e1; 
              }
              td { 
                padding: 12px; 
                border: 1px solid #e2e8f0; 
                font-size: 14px; 
              }
              .student-name { font-weight: 800; color: #1e293b; font-size: 16px; margin-bottom: 4px; }
              .student-meta { color: #64748b; font-size: 12px; font-weight: 600; }
              .meta-val { font-weight: bold; color: #334155; }
              .status-tag {
                font-size: 11px;
                font-weight: 800;
                padding: 4px 10px;
                border-radius: 20px;
                text-transform: uppercase;
                display: inline-block;
              }
              .status-active { background: #dcfce7; color: #166534; }
              .status-inactive { background: #fee2e2; color: #991b1b; }
              .footer { 
                margin-top: 40px; 
                text-align: center; 
                font-size: 12px; 
                color: #94a3b8; 
                border-top: 1px solid #e2e8f0; 
                padding-top: 10px; 
              }
              .print-btn {
                display: block;
                width: 200px;
                margin: 20px auto;
                padding: 12px 24px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
              }
              @media print {
                .print-btn { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <button class="print-btn" onclick="window.print()">🖨️ Print Document</button>
              <div class="header">
                <h2>Student Directory Report</h2>
                <p>Filter: ${activeTab.toUpperCase()} | Total count: ${filteredStudents.length} &bull; Generated: ${new Date().toLocaleDateString()}</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Student Info</th>
                    <th>Class & Section</th>
                    <th>Status</th>
                    <th>Parents Contact</th>
                    <th>Parent Consent</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                  ${emptyHtml}
                </tbody>
              </table>
              <div class="footer">
                Generated by Student Attendance and Engagement Platform &bull; ${new Date().toLocaleString()}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      Alert.alert("Print PDF", "Print list generated! Please use the web dashboard to print/save this student roster as a PDF.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 26, fontWeight: '900', color: '#1e293b', letterSpacing: -0.5 }}>Student Profiles</Text>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#64748b', marginTop: 4 }}>Manage and track your students' wellness.</Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity onPress={() => setIsCsvModalOpen(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14, paddingVertical: 12 }}>
            <Upload size={14} color="#1e293b" style={{ marginRight: 6 }} />
            <Text style={{ color: '#1e293b', fontWeight: '800', fontSize: 13 }}>Bulk CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsAddModalOpen(true)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#9333ea', borderRadius: 14, paddingVertical: 12 }}>
            <UserPlus size={14} color="#fff" style={{ marginRight: 6 }} />
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Add Student</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrint} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingVertical: 12 }}>
            <Printer size={14} color="#475569" style={{ marginRight: 6 }} />
            <Text style={{ color: '#475569', fontWeight: '800', fontSize: 13 }}>Print PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Stat Squares Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {[
            { id: "all", label: "ALL ENROLLED", value: students.length, icon: Users, color: "#3b82f6", bg: "#eff6ff" },
            { id: "active", label: "ACTIVE", value: activeStudents.length, icon: UserCheck, color: "#16a34a", bg: "#f0fdf4" },
            { id: "inactive", label: "INACTIVE", value: inactiveStudents.length, icon: UserX, color: "#dc2626", bg: "#fef2f2" },
            { id: "present", label: "PRESENT TODAY", value: students.filter(s => s.timeline?.some((e: any) => e.day === "Today" || e.date === getUSATodayDateStr())).length, icon: CheckCircle2, color: "#9333ea", bg: "#faf5ff" },
          ].map((tab) => (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setActiveTab(tab.id as any)}
              activeOpacity={0.8}
              style={{ 
                width: (width - 50) / 2, 
                backgroundColor: tab.bg, 
                borderWidth: activeTab === tab.id ? 2 : 1, 
                borderColor: activeTab === tab.id ? tab.color : '#f1f5f9', 
                borderRadius: 20, 
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeTab === tab.id ? 0.08 : 0,
                shadowRadius: 6,
                elevation: activeTab === tab.id ? 1 : 0
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <tab.icon size={20} color={tab.color} />
                <Text style={{ fontSize: 24, fontWeight: '900', color: tab.color }}>{tab.value}</Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 }}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.02, shadowRadius: 5, marginBottom: 24 }}>
          <Search size={20} color="#94a3b8" />
          <TextInput 
            placeholder="Search students by name or roll..." 
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500', color: '#334155' }}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* List of Students */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#9333ea" style={{ marginTop: 20 }} />
        ) : (
          <View style={{ gap: 14 }}>
            {filteredStudents.map(student => {
              const checkedInToday = student.timeline?.find((e: any) => e.day === "Today" || e.date === getUSATodayDateStr());
              return (
                <TouchableOpacity 
                  key={student.rollNumber} 
                  onPress={() => handleOpenDetail(student)}
                  activeOpacity={0.8}
                  style={{ backgroundColor: '#fff', padding: 16, borderRadius: 24, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#f8fafc' }}
                >
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#faf5ff', alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#e9d5ff' }}>
                    {student.profilePhoto ? (
                      <Image source={{ uri: student.profilePhoto }} style={{ width: 50, height: 50 }} />
                    ) : (
                      <Text style={{ fontSize: 18, fontWeight: '900', color: '#a855f7' }}>{student.firstName[0]}</Text>
                    )}
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>
                      {student.firstName} {student.lastInitial}.
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b', marginTop: 3 }}>
                      Roll: {student.rollNumber} • {student.class}
                    </Text>
                  </View>

                  {/* Status Indicator */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {checkedInToday ? (
                      <View style={{ backgroundColor: getMoodBg(checkedInToday.score), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 15 }}>{checkedInToday.emoji || '😊'}</Text>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: getMoodColor(checkedInToday.score) }}>{checkedInToday.score}/10</Text>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b' }}>PENDING</Text>
                      </View>
                    )}
                    <ChevronRight size={18} color="#cbd5e1" />
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {filteredStudents.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#94a3b8' }}>No students found</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Import/Export CSV Modal */}
      <Modal visible={isCsvModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>Import via CSV</Text>
              <TouchableOpacity onPress={() => setIsCsvModalOpen(false)} style={{ backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, fontWeight: '500', color: '#64748b', marginBottom: 20, lineHeight: 20 }}>
              Upload a CSV file with columns:{"\n"}
              <Text style={{ fontWeight: '800', color: '#4f46e5' }}>firstName, lastInitial, rollNumber, class_name</Text>
            </Text>

            {/* Clickable Dash Area for Selecting & Uploading CSV */}
            <TouchableOpacity 
              onPress={handleCsvUpload}
              disabled={isImportingCsv}
              style={{ 
                borderWidth: 2, 
                borderStyle: 'dashed', 
                borderColor: '#c7d2fe', 
                borderRadius: 20, 
                backgroundColor: '#f5f7ff', 
                paddingVertical: 36, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 24
              }}
            >
              {isImportingCsv ? (
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator size="large" color="#4f46e5" />
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#4f46e5' }}>Uploading & Parsing CSV...</Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <Upload size={32} color="#4f46e5" style={{ marginBottom: 4 }} />
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>Click to select CSV</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 }} />

            {/* Alternative Action: Export current roster */}
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' }}>EXPORT DATABASE</Text>
            
            <TouchableOpacity 
              onPress={() => {
                setIsCsvModalOpen(false);
                setTimeout(handleExportCSV, 300);
              }}
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                backgroundColor: '#fff', 
                borderWidth: 1, 
                borderColor: '#e2e8f0', 
                borderRadius: 14, 
                paddingVertical: 14,
                gap: 8
              }}
            >
              <Download size={16} color="#1e293b" />
              <Text style={{ color: '#1e293b', fontWeight: '800', fontSize: 15 }}>Export Roster to CSV</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

      {/* Add Student Modal */}
      {/* Add Student Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, maxHeight: '90%' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#1e293b' }}>Add New Student</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)} style={{ backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              
              {/* Row 1: First Name & Last Name */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>FIRST NAME</Text>
                  <TextInput 
                    placeholder="e.g. John" 
                    value={newFirstName} 
                    onChangeText={setNewFirstName}
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>LAST NAME / INITIAL</Text>
                  <TextInput 
                    placeholder="e.g. Smith" 
                    value={newLastInitial} 
                    onChangeText={setNewLastInitial}
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
                  />
                </View>
              </View>

              {/* Row 2: Roll Number & Blood Group */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>ROLL NUMBER</Text>
                  <TextInput 
                    placeholder="e.g. 23" 
                    value={newRollNumber} 
                    onChangeText={setNewRollNumber}
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>BLOOD GROUP</Text>
                  <TextInput 
                    placeholder="e.g. O+" 
                    value={newBloodGroup} 
                    onChangeText={setNewBloodGroup}
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
                  />
                </View>
              </View>

              {/* Dynamic horizontal Class list */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>SELECT CLASS</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {(masterClasses.length > 0 ? masterClasses : ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3']).map((cName) => (
                    <TouchableOpacity 
                      key={cName}
                      onPress={() => setNewClass(cName)}
                      style={{ backgroundColor: newClass === cName ? '#faf5ff' : '#f8fafc', borderWidth: 1.5, borderColor: newClass === cName ? '#9333ea' : '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text style={{ color: newClass === cName ? '#9333ea' : '#475569', fontWeight: '800', fontSize: 13 }}>{cName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Dynamic horizontal Section list */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>SELECT SECTION</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {(masterSections.length > 0 ? masterSections : ['A', 'B', 'C', 'D']).map((sName) => (
                    <TouchableOpacity 
                      key={sName}
                      onPress={() => setNewSection(sName)}
                      style={{ backgroundColor: newSection === sName ? '#faf5ff' : '#f8fafc', borderWidth: 1.5, borderColor: newSection === sName ? '#9333ea' : '#cbd5e1', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}
                    >
                      <Text style={{ color: newSection === sName ? '#9333ea' : '#475569', fontWeight: '800', fontSize: 13 }}>{sName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Parents details */}
              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>PARENTS NAME</Text>
                <TextInput 
                  placeholder="e.g. Mr. Smith" 
                  value={newParentsName} 
                  onChangeText={setNewParentsName}
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
                />
              </View>

              <View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>PARENTS PHONE</Text>
                <TextInput 
                  placeholder="e.g. +91 9876543210" 
                  value={newParentsPhone} 
                  onChangeText={setNewParentsPhone}
                  keyboardType="phone-pad"
                  style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b', backgroundColor: '#f8fafc' }}
                />
              </View>

              {/* Premium profile photo picker with Cloudinary uploader */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b', letterSpacing: 0.5 }}>PROFILE PHOTO</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#cbd5e1', borderRadius: 16, padding: 16, backgroundColor: '#f8fafc' }}>
                  {newProfilePhoto ? (
                    <Image source={{ uri: newProfilePhoto }} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, borderColor: '#cbd5e1' }} />
                  ) : (
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={24} color="#64748b" />
                    </View>
                  )}
                  <View style={{ flex: 1, gap: 4 }}>
                    <TouchableOpacity 
                      onPress={pickImage} 
                      disabled={isPhotoUploading} 
                      style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center', alignSelf: 'flex-start' }}
                    >
                      <Text style={{ color: '#1e293b', fontWeight: '800', fontSize: 13 }}>
                        {isPhotoUploading ? "Uploading..." : (newProfilePhoto ? "Change Photo" : "Choose File")}
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 10, color: '#64748b', fontWeight: '600' }}>PNG, JPG up to 5MB</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleAddStudent} 
                disabled={isSubmitting}
                style={{ backgroundColor: '#9333ea', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 12 }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Enroll Student</Text>
                )}
              </TouchableOpacity>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
      {/* Modal 1: Redesigned Detail & Report Panel (Image 2 style) */}
      {selectedStudent && (
        <Modal visible={isDetailModalOpen} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, height: height * 0.85, shadowColor: '#0f172a', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 }}>
              
              {/* Header with Edit Pencil & Close button */}
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <TouchableOpacity 
                  onPress={() => setIsEditModalOpen(true)} 
                  style={{ backgroundColor: '#f1f5f9', padding: 10, borderRadius: 20 }}
                >
                  <Pencil size={18} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setIsDetailModalOpen(false)} 
                  style={{ backgroundColor: '#f1f5f9', padding: 10, borderRadius: 20 }}
                >
                  <X size={18} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Centered Avatar / Profile Image */}
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  {selectedStudent.profilePhoto ? (
                    <Image 
                      source={{ uri: selectedStudent.profilePhoto }} 
                      style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#6366f1' }} 
                    />
                  ) : (
                    <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#cbd5e1' }}>
                      <Text style={{ fontSize: 36 }}>🐼</Text>
                    </View>
                  )}
                  
                  <Text style={{ fontSize: 22, fontWeight: '900', color: '#0f172a', marginTop: 12 }}>
                    {selectedStudent.firstName} {selectedStudent.lastInitial || ''}
                  </Text>
                  
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748b', marginTop: 4 }}>
                    Roll: {selectedStudent.rollNumber} | {selectedStudent.class_name || selectedStudent.class || 'Nursery-B'}
                  </Text>
                </View>

                {/* Group Info Card */}
                <View style={{ backgroundColor: '#f8fafc', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9', gap: 14, marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4 }}>BLOOD GROUP</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{selectedStudent.bloodGroup || 'N/A'}</Text>
                    </View>
                    <View style={{ flex: 1, paddingLeft: 16 }}>
                      <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4 }}>SECTION</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>
                        {selectedStudent.class_name ? selectedStudent.class_name.split('-')[1] || 'N/A' : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
                  
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4 }}>PARENTS NAME</Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{selectedStudent.parentsName || 'N/A'}</Text>
                  </View>
                  
                  <View style={{ height: 1, backgroundColor: '#f1f5f9' }} />
                  
                  <View>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.8, marginBottom: 4 }}>PARENTS PHONE</Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>{selectedStudent.parentsPhone || 'N/A'}</Text>
                  </View>
                </View>

                {/* Side-by-side Metric Cards */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                  {/* Left Card: 100% Attendance */}
                  <View style={{ flex: 1, backgroundColor: '#f3e8ff', borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#9333ea' }}>100%</Text>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: '#a855f7', marginTop: 4, letterSpacing: 0.5 }}>ATTENDANCE</Text>
                  </View>

                  {/* Right Card: Parent Consent */}
                  <View style={{ flex: 1.2, backgroundColor: selectedStudent.parentStatus === "Approved" ? '#f0fdf4' : '#fff7ed', borderRadius: 20, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: selectedStudent.parentStatus === "Approved" ? '#16a34a' : '#ea580c' }}>
                      {selectedStudent.parentStatus || 'Pending'}
                    </Text>
                    <Text style={{ fontSize: 10, fontWeight: '900', color: selectedStudent.parentStatus === "Approved" ? '#15803d' : '#f97316', marginTop: 4, marginBottom: 8, letterSpacing: 0.5 }}>PARENT CONSENT</Text>
                    
                    {isUploadingConsent ? (
                      <ActivityIndicator size="small" color={selectedStudent.parentStatus === "Approved" ? "#16a34a" : "#ea580c"} />
                    ) : (
                      selectedStudent.parentStatus === "Approved" && selectedStudent.parentConsentUrl ? (
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity 
                            onPress={() => WebBrowser.openBrowserAsync(selectedStudent.parentConsentUrl!)}
                            style={{ backgroundColor: '#bbf7d0', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                          >
                            <Eye size={10} color="#166534" />
                            <Text style={{ fontSize: 10, fontWeight: '900', color: '#166534' }}>View</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={handleConsentUpload}
                            style={{ backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#bbf7d0' }}
                          >
                            <Text style={{ fontSize: 10, fontWeight: '900', color: '#166534' }}>Change</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity 
                          onPress={handleConsentUpload}
                          style={{ backgroundColor: '#ea580c', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        >
                          <Upload size={10} color="#fff" />
                          <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff' }}>Upload Form</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>

                {/* Weekly Emotional Timeline */}
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: '#0f172a', marginBottom: 12 }}>💖 Weekly Emotional Timeline</Text>
                  
                  <View style={{ gap: 10 }}>
                    {(selectedStudent.timeline && selectedStudent.timeline.length > 0) ? (
                      selectedStudent.timeline.map((entry: any, index: number) => {
                        const isAlert = entry.score <= 4;
                        return (
                          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#f1f5f9' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: getMoodColor(entry.score) }} />
                              <View>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1e293b' }}>{entry.day || "Today"}</Text>
                                <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b', marginTop: 2 }}>
                                  {entry.emotions && entry.emotions.length > 0 ? entry.emotions.join(', ') : 'Calm'}
                                </Text>
                              </View>
                            </View>
                            
                            {isAlert ? (
                              <View style={{ backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                <Text style={{ fontSize: 9, fontWeight: '900', color: '#ef4444' }}>{entry.score}/10 ALERT</Text>
                              </View>
                            ) : (
                              <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                <Text style={{ fontSize: 9, fontWeight: '900', color: '#16a34a' }}>{entry.score}/10 STABLE</Text>
                              </View>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' }}>
                        <Smile size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#94a3b8' }}>No daily check-ins recorded yet.</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Bottom Button: View Full Report */}
                <TouchableOpacity 
                  onPress={() => setIsReportModalOpen(true)}
                  style={{ backgroundColor: '#1e3a8a', borderRadius: 20, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                >
                  <BarChart2 size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>View Full Report</Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal 2: Edit Student Profile (Image 1 style) */}
      {selectedStudent && (
        <Modal visible={isEditModalOpen} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 20 }}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ backgroundColor: '#fff', borderRadius: 32, padding: 24, maxHeight: height * 0.85, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>Edit Student Profile</Text>
                <TouchableOpacity onPress={() => setIsEditModalOpen(false)} style={{ backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 }}>
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 20 }}>
                {/* Row 1: First Name & Last Initial */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>FIRST NAME</Text>
                    <TextInput 
                      placeholder="First Name" 
                      value={editFirstName} 
                      onChangeText={setEditFirstName}
                      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>LAST INITIAL</Text>
                    <TextInput 
                      placeholder="Last Initial" 
                      value={editLastInitial} 
                      onChangeText={setEditLastInitial}
                      maxLength={1}
                      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                    />
                  </View>
                </View>

                {/* Row 2: Class & Section */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>CLASS</Text>
                    <TextInput 
                      placeholder="Class" 
                      value={editClass} 
                      onChangeText={setEditClass}
                      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>SECTION</Text>
                    <TextInput 
                      placeholder="Section" 
                      value={editSection} 
                      onChangeText={setEditSection}
                      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                    />
                  </View>
                </View>

                {/* Row 3: Blood Group & Parents Phone */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>BLOOD GROUP</Text>
                    <TextInput 
                      placeholder="Blood Group" 
                      value={editBloodGroup} 
                      onChangeText={setEditBloodGroup}
                      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>PARENTS PHONE</Text>
                    <TextInput 
                      placeholder="Parents Phone" 
                      value={editParentsPhone} 
                      onChangeText={setEditParentsPhone}
                      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                    />
                  </View>
                </View>

                {/* Row 4: Parents Name */}
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>PARENTS NAME</Text>
                  <TextInput 
                    placeholder="Parents Name" 
                    value={editParentsName} 
                    onChangeText={setEditParentsName}
                    style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                  />
                </View>

                {/* Row 5: Profile Photo dashed block */}
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>PROFILE PHOTO</Text>
                  <TouchableOpacity 
                    onPress={pickEditImage}
                    style={{ borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', borderRadius: 16, padding: 20, alignItems: 'center', backgroundColor: '#f8fafc', gap: 8 }}
                  >
                    {isEditPhotoUploading ? (
                      <ActivityIndicator size="small" color="#1e3a8a" />
                    ) : editProfilePhoto ? (
                      <View style={{ alignItems: 'center', gap: 8 }}>
                        <Image source={{ uri: editProfilePhoto }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#1e3a8a' }}>Change Photo</Text>
                      </View>
                    ) : (
                      <View style={{ alignItems: 'center', gap: 8 }}>
                        <Upload size={24} color="#64748b" />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#64748b' }}>Choose File</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* OTP Passcode & Active Enrollment toggle (for robustness and complete feature set) */}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 8, letterSpacing: 0.5 }}>OTP PASSWORD</Text>
                    <TextInput 
                      placeholder="OTP Code" 
                      value={editOtp} 
                      onChangeText={setEditOtp}
                      maxLength={4}
                      keyboardType="numeric"
                      style={{ borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, fontWeight: '600', color: '#1e293b' }}
                    />
                  </View>
                  <View style={{ flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#cbd5e1' }}>
                    <View>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#1e293b' }}>Active</Text>
                      <Text style={{ fontSize: 9, fontWeight: '600', color: '#64748b' }}>Roster status</Text>
                    </View>
                    <Switch 
                      value={editStatus === "active"} 
                      onValueChange={(val) => setEditStatus(val ? "active" : "inactive")} 
                      trackColor={{ true: '#1e3a8a' }}
                    />
                  </View>
                </View>

                {/* Save and Delete Actions */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  <TouchableOpacity 
                    onPress={handleDeleteStudent}
                    style={{ flex: 1, backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fca5a5', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={{ color: '#ef4444', fontWeight: '800', fontSize: 14 }}>Delete</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={handleUpdateStudent}
                    disabled={isSubmitting}
                    style={{ flex: 1.5, backgroundColor: '#1e3a8a', borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Save size={16} color="#fff" />
                        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Update Profile</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}

      {/* Modal 3: Full Report Modal (Image 3 style) */}
      {selectedStudent && (
        <Modal visible={isReportModalOpen} animationType="fade" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 32, padding: 24, maxHeight: height * 0.8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 }}>
              
              {/* Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>
                  {selectedStudent.firstName}'s Full Report
                </Text>
                <TouchableOpacity onPress={() => setIsReportModalOpen(false)} style={{ backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 }}>
                  <X size={16} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* 3 side-by-side statistic blocks */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
                  {/* Attendance Card */}
                  <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e3a8a' }}>100%</Text>
                    <Text style={{ fontSize: 8, fontWeight: '900', color: '#64748b', marginTop: 6, textAlign: 'center', letterSpacing: 0.5 }}>YEARLY ATTENDANCE</Text>
                  </View>

                  {/* Avg Mood Card */}
                  <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#1e3a8a' }}>
                      {(() => {
                        const timeline = selectedStudent.timeline || [];
                        return timeline.length > 0
                          ? (timeline.reduce((acc: number, t: any) => acc + (t.score || 0), 0) / timeline.length).toFixed(1)
                          : 'N/A';
                      })()}
                    </Text>
                    <Text style={{ fontSize: 8, fontWeight: '900', color: '#64748b', marginTop: 6, textAlign: 'center', letterSpacing: 0.5 }}>AVG MOOD SCORE</Text>
                  </View>

                  {/* Alerts Triggered Card */}
                  <View style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' }}>
                    <Text style={{ fontSize: 16, fontWeight: '900', color: '#ef4444' }}>
                      {(() => {
                        const timeline = selectedStudent.timeline || [];
                        return timeline.length > 0
                          ? timeline.filter((t: any) => t.score <= 4).length
                          : 0;
                      })()}
                    </Text>
                    <Text style={{ fontSize: 8, fontWeight: '900', color: '#64748b', marginTop: 6, textAlign: 'center', letterSpacing: 0.5 }}>ALERTS TRIGGERED</Text>
                  </View>
                </View>

                {/* AI Wellness Insight Card */}
                <View style={{ backgroundColor: '#eff6ff', borderWidth: 1.5, borderColor: '#bfdbfe', borderRadius: 20, padding: 18, gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Lightbulb size={18} color="#1d4ed8" />
                    <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e40af' }}>AI Wellness Insight</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e40af', lineHeight: 20, marginTop: 4 }}>
                    {(() => {
                      const timeline = selectedStudent.timeline || [];
                      if (timeline.length === 0) {
                        return `No daily check-ins recorded yet for ${selectedStudent.firstName}. AI analysis will become active once emotional check-ins are logged.`;
                      }
                      const avg = timeline.reduce((acc: number, t: any) => acc + (t.score || 0), 0) / timeline.length;
                      if (avg <= 4) {
                        return `${selectedStudent.firstName} has triggered multiple low mood alerts this week. We highly recommend scheduling an informal parent check-in or counseling session to discuss wellness strategies.`;
                      }
                      return `${selectedStudent.firstName} has shown positive emotional improvement this week. Participation in morning check-ins has been highly consistent.`;
                    })()}
                  </Text>
                </View>

              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
