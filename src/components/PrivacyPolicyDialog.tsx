import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyDialog = ({ open, onOpenChange }: PrivacyPolicyDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Information We Collect</h3>
              <p>
                VRK Solutions collects personal information that you provide directly to us, including:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Name and phone number for account registration</li>
                <li>Educational preferences and course selections</li>
                <li>Usage data and learning progress</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. How We Use Your Information</h3>
              <p>We use the information we collect to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Provide, maintain, and improve our educational services</li>
                <li>Send you notifications about new content and updates</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage patterns to enhance user experience</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored securely using industry-standard encryption protocols.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Data Retention</h3>
              <p>
                We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time through the Account settings.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Your Rights</h3>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Access and receive a copy of your personal data</li>
                <li>Request correction of inaccurate personal data</li>
                <li>Request deletion of your account and personal data</li>
                <li>Withdraw consent for data processing at any time</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Third-Party Services</h3>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as required by law or to provide our services.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Children's Privacy</h3>
              <p>
                Our services are designed for students of all ages. We are committed to protecting the privacy of minors and comply with applicable child protection regulations.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">8. Changes to This Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">9. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us through the Help & Support section in the app.
              </p>
            </section>

            <p className="text-xs text-muted-foreground pt-4 border-t">
              Last updated: January 2026
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyDialog;
