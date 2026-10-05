import React, { useState } from 'react';
import { Prescription } from '../../types/doctor.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPrescription: (data: Partial<Prescription>) => Promise<any>;
}

export const PrescriptionBuilderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmitPrescription
}) => {
  const [patientName, setPatientName] = useState('');
  const [uhid, setUhid] = useState('');
  const [age, setAge] = useState(42);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState(74);
  const [diagnosis, setDiagnosis] = useState('');
  const [icd10, setIcd10] = useState('');
  const [advice, setAdvice] = useState('Review after completing prescribed course. Maintain hydration.');
  
  const [labOrders, setLabOrders] = useState<Array<{ testCode: string; testName: string; department: string; urgency: 'Routine' | 'Urgent / Priority' | 'STAT / Emergency'; status: string }>>([]);
  const [medications, setMedications] = useState<Array<{ drugName: string; dosage: string; frequency: string; duration: string }>>([
    { drugName: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: '1-0-1 (After Meals)', duration: '3 Days' }
  ]);

  if (!isOpen) return null;

  const quickPanels = [
    { code: 'CBC', name: 'Complete Blood Count (CBC + ESR)', dept: 'Hematology' },
    { code: 'LFT', name: 'Liver Function Test (LFT)', dept: 'Biochemistry' },
    { code: 'KFT', name: 'Kidney Function Test (KFT)', dept: 'Biochemistry' },
    { code: 'LIPID', name: 'Lipid Profile Comprehensive', dept: 'Biochemistry' },
    { code: 'HBA1C', name: 'HbA1c & Fasting Blood Sugar', dept: 'Biochemistry' },
    { code: 'THYROID', name: 'Thyroid Profile (T3, T4, TSH)', dept: 'Biochemistry' }
  ];

  const addPanel = (panel: typeof quickPanels[0]) => {
    if (!labOrders.some(o => o.testCode === panel.code)) {
      setLabOrders(prev => [...prev, {
        testCode: panel.code,
        testName: panel.name,
        department: panel.dept,
        urgency: 'Routine',
        status: 'Prescribed'
      }]);
    }
  };

  const removePanel = (code: string) => {
    setLabOrders(prev => prev.filter(o => o.testCode !== code));
  };

  const addMedRow = () => {
    setMedications(prev => [...prev, { drugName: '', dosage: '1 Tablet', frequency: '1-0-1', duration: '5 Days' }]);
  };

  const updateMed = (idx: number, field: string, val: string) => {
    setMedications(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val } : m));
  };

  const removeMed = (idx: number) => {
    setMedications(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitPrescription({
      patient: {
        patientId: `PAT-${Date.now().toString().slice(-4)}`,
        uhid: uhid || `UHID-${Math.floor(10000 + Math.random() * 90000)}`,
        fullName: patientName,
        age: Number(age),
        gender
      },
      vitals: {
        bloodPressure: bp,
        pulseRate: Number(pulse)
      },
      clinicalSummary: {
        provisionalDiagnosis: diagnosis || 'General Examination',
        icd10Codes: [{ code: icd10 || 'Z00.0', description: diagnosis || 'General Checkup' }]
      },
      labOrders,
      medications,
      adviceAndLifestyle: advice,
      status: 'Active'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-teal-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <i className="fa-solid fa-file-prescription"></i>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">Smart E-Prescription & Diagnostic Order (CPOE)</h3>
              <div className="text-xs text-slate-400">Directly sync prescribed lab tests with ELIS sample collection counter</div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Ramesh Chandra"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">UHID / Patient ID</label>
              <input
                type="text"
                value={uhid}
                onChange={(e) => setUhid(e.target.value)}
                placeholder="UHID-98214"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-slate-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vitals and ICD-10 */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Blood Pressure</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Pulse (bpm)</label>
              <input
                type="number"
                value={pulse}
                onChange={(e) => setPulse(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Type-2 Diabetes Mellitus"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">ICD-10 Code</label>
              <input
                type="text"
                value={icd10}
                onChange={(e) => setIcd10(e.target.value)}
                placeholder="e.g. E11.9"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Rapid Diagnostic Lab Panels */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <i className="fa-solid fa-bolt text-amber-400"></i>
              <span>One-Click Diagnostic Lab Panels:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPanels.map(p => (
                <button
                  type="button"
                  key={p.code}
                  onClick={() => addPanel(p)}
                  className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500 hover:text-white text-sky-300 rounded-lg border border-sky-500/30 transition font-semibold"
                >
                  + {p.name}
                </button>
              ))}
            </div>

            {labOrders.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {labOrders.map(o => (
                  <div key={o.testCode} className="flex items-center justify-between p-2 bg-slate-900 rounded-lg border border-slate-700">
                    <span className="text-slate-200">
                      <strong className="text-sky-300 font-mono">[{o.testCode}]</strong> {o.testName}
                    </span>
                    <button type="button" onClick={() => removePanel(o.testCode)} className="text-rose-400 hover:text-rose-300 px-2">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Medications Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300">💊 Prescribed Medications:</span>
              <button type="button" onClick={addMedRow} className="text-teal-400 hover:underline font-bold">
                + Add Medicine Row
              </button>
            </div>
            <div className="space-y-2">
              {medications.map((m, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-2 bg-slate-950/80 rounded-lg border border-slate-800">
                  <input
                    type="text"
                    value={m.drugName}
                    onChange={(e) => updateMed(idx, 'drugName', e.target.value)}
                    placeholder="Drug Name"
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                  <input
                    type="text"
                    value={m.dosage}
                    onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
                    placeholder="Dosage"
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                  <input
                    type="text"
                    value={m.frequency}
                    onChange={(e) => updateMed(idx, 'frequency', e.target.value)}
                    placeholder="Frequency"
                    className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.duration}
                      onChange={(e) => updateMed(idx, 'duration', e.target.value)}
                      placeholder="Duration"
                      className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 w-full"
                    />
                    <button type="button" onClick={() => removeMed(idx)} className="text-rose-400 hover:text-rose-300 px-2">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div>
            <label className="block text-slate-400 mb-1">Clinical Advice & Instructions</label>
            <input
              type="text"
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-gradient-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20">
              <i className="fa-solid fa-check mr-1"></i> Generate Digital E-Prescription
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
