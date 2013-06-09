#!/usr/bin/perl
use strict;
use Perl::Module;
use Data::Hub qw($Hub);
use App::Console::Prompts qw(:all);

use Net::SMTP::SSL;
$IO::Socket::SSL::DEBUG = 1;

my $t_addr = shift @ARGV or die 'Missing template';
my $template = $Hub->get($t_addr) or die 'Template not found';
my $pm = $Hub->get('./Mailer.pm');
my $smtp = $Hub->get('./settings.hf/smtp');
my $un = $$smtp{'sasl_username'};
my $passwd = prompt(sprintf('Password for %s', $un), -noecho);
my $mailer = $$pm{'new'}(smtp => $smtp);
my $data = {num => int(rand(1000))};
$mailer->set_arg('sasl_password', $passwd);
$mailer->send_templated_mail($template, $data);
