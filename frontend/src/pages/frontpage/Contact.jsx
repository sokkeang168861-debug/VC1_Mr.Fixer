import { motion } from 'motion/react';
import { MapPin, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const contactInfo = [
    {
      icon: <MapPin size={24} />,
      title: 'Office Address',
      desc: '#123 Street 2004, Sangkat Kakab, Khan Porsenchey, Phnom Penh, Cambodia',
      bg: 'bg-violet-50'
    },
    {
      icon: <Mail size={24} />,
      title: 'Support Email',
      desc: 'support@mrfixer.com help@mrfixer.com',
      bg: 'bg-violet-50'
    },
    {
      icon: <Phone size={24} />,
      title: 'Phone Number',
      desc: '+855 (0) 23 999 888 +855 (0) 12 345 678',
      bg: 'bg-violet-50'
    }
  ];

  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 space-y-8"
            >
              <h1 className="text-6xl lg:text-8xl font-display text-slate-900 leading-tight">
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                Have questions or need assistance with a repair? Our friendly support team is here to help you get your home back in shape.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <img 
                      key={i}
                      src={`https://i.pravatar.cc/150?u=${i}`} 
                      className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                      alt="Support team"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-600">Our team is active 24/7</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 relative"
            >
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800" 
                  alt="Customer support" 
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-20">
            {/* Left Column: Info */}
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="text-4xl font-display text-slate-900 mb-6">Reach Out to Us</h2>
                <p className="text-slate-500 leading-relaxed">
                  Whether it's a small leak or a major renovation, we're ready to connect you with the best professionals in Cambodia.
                </p>
              </div>

              <div className="space-y-8">
                {contactInfo.map((info, idx) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-6 p-6 rounded-3xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className={`w-14 h-14 ${info.bg} rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform`}>
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-display font-bold text-slate-900 mb-2">{info.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">{info.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Form */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-1 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
            >
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-display font-bold text-slate-900">Message Sent!</h3>
                    <p className="text-slate-500">Thank you for reaching out. Our team will get back to you shortly.</p>
                  </div>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-primary font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-8" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Your Message</label>
                    <textarea 
                      rows={5}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us more about your needs..."
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                    />
                  </div>

                  <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] flex items-center justify-center gap-3">
                    Send Message
                    <Send size={18} />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-display text-slate-900">Serving Cambodia's major cities</h2>
              <p className="text-slate-500 leading-relaxed">
                We currently operate in Phnom Penh and Siem Reap, with hundreds of professionals ready to serve your neighborhood.
              </p>
              <ul className="space-y-4">
                {['Phnom Penh Metropolitan Area', 'Siem Reap City Center & Surrounding'].map((area) => (
                  <li key={area} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <CheckCircle2 size={14} />
                    </div>
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 w-full h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.770660692104!2d104.88214227496924!3d11.56829188863266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109519fe4077d59%3A0x405a357705354040!2sPasserelles%20num%C3%A9riques%20Cambodia%20(PNC)!5e0!3m2!1sen!2skh!4v1709112345678!5m2!1sen!2skh" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
