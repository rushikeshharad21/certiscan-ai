import { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import { Search, Mail, Phone, Building2, FileStack, CheckCircle2, Loader2, Users } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/auth/admin/students');
        setStudents(response.data);
      } catch (error) {
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const debouncedSetSearch = useMemo(() => debounce((value) => setSearchQuery(value), 300), []);

  const handleSearchChange = useCallback(
    (e) => {
      setSearchInput(e.target.value);
      debouncedSetSearch(e.target.value);
    },
    [debouncedSetSearch]
  );

  const filteredStudents = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        query.trim() === '' ||
        student.name?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.collegeName?.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const initials = (name) =>
    name
      ?.split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'S';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-slate-900" size={28} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500 mt-1">
          {students.length} registered students.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search by name, email, or college..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={32} className="mx-auto mb-3" />
          <p className="text-sm">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredStudents.map((student) => (
            <div
              key={student._id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                  {initials(student.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{student.name}</p>
                  <p className="text-xs text-slate-400 truncate">{student.email}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                {student.collegeName && (
                  <div className="flex items-center gap-1.5">
                    <Building2 size={13} className="shrink-0" />
                    <span className="truncate">{student.collegeName}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone size={13} className="shrink-0" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <FileStack size={13} className="text-slate-400" />
                  {student.totalDocuments} uploaded
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 size={13} />
                  {student.verifiedDocuments} verified
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;